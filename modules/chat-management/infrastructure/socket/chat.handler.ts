import { Types } from "mongoose";
import { Server } from "socket.io";

import { ChatRepository, RoomRepository } from "../repository";
import { decryptChatText, encryptChatText } from "../../utils";
import { AuthedSocket } from ".";
import type { RoomDocument } from "../../domain/models/room";
import {
  AppError,
  BadRequestError,
  InternalError,
  NotFoundError,
  UnprocessableError,
} from "../../../../shared/errors";

// ─── Types ────────────────────────────────────────────────────────────────────

interface SendMessagePayload {
  room_id: string;
  text: string;
}

interface UpdateMessagePayload {
  message_id: string;
  updated_text: string;
}

interface LastMessagePayload {
  room_id: string;
  text: string;
  sender_id: string | null;
  timestamp: Date | null;
  unread_count: number;
}

interface RoomParticipantSummary {
  _id: Types.ObjectId;
  name?: string | null;
  persona?: string | null;
}

interface RoomParticipantsSummary {
  one: RoomParticipantSummary;
  two: RoomParticipantSummary;
}

// ─── Handler ──────────────────────────────────────────────────────────────────

export const chatHandler = (io: Server, socket: AuthedSocket): void => {
  socket.on("join_room", (roomId: string) =>
    runSocketAction(socket, () => joinRoom(socket, roomId)),
  );
  socket.on("send_message", (data: SendMessagePayload) =>
    runSocketAction(socket, () => sendMessage(io, socket, data)),
  );
  socket.on("delete_message", (messageId: string) =>
    runSocketAction(socket, () => deleteMessage(io, messageId)),
  );
  socket.on("update_message", (data: UpdateMessagePayload) =>
    runSocketAction(socket, () => updateMessage(io, data)),
  );
  socket.on("leave_room", (roomId: string) => socket.leave(roomId));
};

// ─── Event Handlers ───────────────────────────────────────────────────────────

const joinRoom = async (
  socket: AuthedSocket,
  roomId: string,
): Promise<void> => {
  socket.join(roomId);

  const room = await RoomRepository.findRoomById(roomId);
  if (!room) throw new NotFoundError("Room");

  await room.resetUnreadMessages(socket.userId);
  socket.emit("unread_reset", { room_id: roomId });
};

const sendMessage = async (
  io: Server,
  socket: AuthedSocket,
  { room_id, text }: SendMessagePayload,
): Promise<void> => {
  const room = await RoomRepository.findRoomById(room_id);
  if (!room) throw new NotFoundError("Room");
  if (room.is_deleted) throw new BadRequestError("Room is deleted");

  const participants = getRoomParticipants(room);
  if (!participants) {
    throw new UnprocessableError("Room participants are missing");
  }

  const { one, two } = participants;
  const senderId = socket.userId;
  const recipientId = resolveRecipient(
    senderId,
    one._id.toString(),
    two._id.toString(),
  );

  const isRecipientInRoom = await isUserInRoom(io, room_id, recipientId);

  await room.updateLastMessage(text, senderId);

  if (!isRecipientInRoom) {
    const recipient = one._id.toString() === senderId ? two : one;
    io.to(recipientId).emit("notification", recipient);
    await room.incrementUnreadMessages(recipientId);
  }

  const savedMessage = await ChatRepository.createChat({
    room_id: new Types.ObjectId(room_id),
    sender_id: new Types.ObjectId(senderId),
    text: encryptChatText(text),
  });

  // Send decrypted text back to room
  io.to(room_id).emit("receive_message", { ...savedMessage.toObject(), text });

  const lastMessagePayload: LastMessagePayload = {
    room_id,
    text,
    sender_id: senderId,
    timestamp: savedMessage.createdAt,
    unread_count: room.unread_messages.get(recipientId) ?? 0,
  };

  emitToParticipants(
    io,
    one._id.toString(),
    two._id.toString(),
    "last_message_updated",
    lastMessagePayload,
  );
};

const deleteMessage = async (io: Server, messageId: string): Promise<void> => {
  const message = await ChatRepository.findChatById(messageId);
  if (!message) throw new NotFoundError("Message");

  message.text = decryptChatText(message.text);
  const room_id = message.room_id.toString();
  const senderId = message.sender_id?.toString();

  const lastMessage = await ChatRepository.findLatestMessage(room_id);
  if (lastMessage) lastMessage.text = decryptChatText(lastMessage.text);

  await message.deleteMessage();

  io.to(room_id).emit("message_deleted", messageId);

  if (!senderId) {
    throw new UnprocessableError("Message sender is missing");
  }

  // Only update last message preview if the deleted message was the latest
  const wasLatest = lastMessage?._id.toString() === messageId;
  if (!wasLatest) return;

  const room = await RoomRepository.findRoomById(room_id);
  if (!room) throw new NotFoundError("Room");

  const participants = getRoomParticipants(room);
  if (!participants) {
    throw new UnprocessableError("Room participants are missing");
  }

  const { one, two } = participants;
  const recipientId = resolveRecipient(
    senderId,
    one._id.toString(),
    two._id.toString(),
  );

  const previousMessage = await ChatRepository.findLatestMessage(room_id);
  if (previousMessage)
    previousMessage.text = decryptChatText(previousMessage.text);

  const previousSenderId = previousMessage?.sender_id?.toString() ?? null;
  const lastMessagePayload: LastMessagePayload =
    previousMessage && previousSenderId
      ? {
          room_id,
          text: previousMessage.text,
          sender_id: previousSenderId,
          timestamp: previousMessage.createdAt,
          unread_count: room.unread_messages.get(recipientId) ?? 0,
        }
      : {
          room_id,
          text: "",
          sender_id: null,
          timestamp: null,
          unread_count: 0,
        };

  await room.updateLastMessage(lastMessagePayload.text, senderId);

  const unreadCount = room.unread_messages.get(recipientId) ?? 0;
  if (unreadCount > 0) await room.decrementUnreadMessages(recipientId);

  emitToParticipants(
    io,
    one._id.toString(),
    two._id.toString(),
    "last_message_updated",
    lastMessagePayload,
  );
};

const updateMessage = async (
  io: Server,
  { message_id, updated_text }: UpdateMessagePayload,
): Promise<void> => {
  const message = await ChatRepository.findChatById(message_id);
  if (!message) throw new NotFoundError("Message");

  const room_id = message.room_id.toString();
  const senderId = message.sender_id?.toString();

  await message.updateMessage(updated_text);
  io.to(room_id).emit("message_updated", { message_id, text: updated_text });

  const lastMessage = await ChatRepository.findLatestMessage(room_id);
  if (!lastMessage || lastMessage._id.toString() !== message_id) return;

  const room = await RoomRepository.findRoomById(room_id);
  if (!room) throw new NotFoundError("Room");
  if (!senderId) throw new UnprocessableError("Message sender is missing");

  const participants = getRoomParticipants(room);
  if (!participants) {
    throw new UnprocessableError("Room participants are missing");
  }

  const { one, two } = participants;
  const recipientId = resolveRecipient(
    senderId,
    one._id.toString(),
    two._id.toString(),
  );

  await room.updateLastMessage(updated_text, senderId);

  const lastMessagePayload: LastMessagePayload = {
    room_id,
    text: updated_text,
    sender_id: senderId,
    timestamp: lastMessage.createdAt,
    unread_count: room.unread_messages.get(recipientId) ?? 0,
  };

  emitToParticipants(
    io,
    one._id.toString(),
    two._id.toString(),
    "last_message_updated",
    lastMessagePayload,
  );
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const resolveRecipient = (
  senderId: string,
  oneId: string,
  twoId: string,
): string => (oneId === senderId ? twoId : oneId);

const getRoomParticipants = (
  room: RoomDocument,
): RoomParticipantsSummary | null => {
  const participants = room.participants;
  if (!participants?.one?._id || !participants?.two?._id) return null;

  return {
    one: {
      _id: participants.one._id,
      name: participants.one.name,
      persona: participants.one.persona,
    },
    two: {
      _id: participants.two._id,
      name: participants.two.name,
      persona: participants.two.persona,
    },
  };
};

const isUserInRoom = async (
  io: Server,
  roomId: string,
  userId: string,
): Promise<boolean> => {
  const sockets = await io.in(roomId).fetchSockets();
  return sockets.some((s) => (s as unknown as AuthedSocket).userId === userId);
};

const runSocketAction = (
  socket: AuthedSocket,
  action: () => Promise<void>,
): void => {
  void action().catch((error: unknown) => {
    socket.emit("error", formatSocketError(error));
  });
};

const formatSocketError = (
  error: unknown,
): { message: string; code: string; statusCode: number } => {
  if (error instanceof AppError) {
    const appError = error;
    return {
      message: appError.message,
      code: appError.code,
      statusCode: appError.statusCode,
    };
  }

  const internalError = new InternalError();
  return {
    message: internalError.message,
    code: internalError.code,
    statusCode: internalError.statusCode,
  };
};
const emitToParticipants = (
  io: Server,
  oneId: string,
  twoId: string,
  event: string,
  payload: unknown,
): void => {
  io.to(oneId).emit(event, payload);
  io.to(twoId).emit(event, payload);
};
