import { Server } from "socket.io";

import { ChatRepository, RoomRepository } from "../repository";
import { decryptChatText, encryptChatText } from "../../utils";
import { AuthedSocket } from ".";

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

// ─── Handler ──────────────────────────────────────────────────────────────────

export const chatHandler = (io: Server, socket: AuthedSocket): void => {
  socket.on("join_room", (roomId: string) => joinRoom(socket, roomId));
  socket.on("send_message", (data: SendMessagePayload) =>
    sendMessage(io, socket, data),
  );
  socket.on("delete_message", (messageId: string) =>
    deleteMessage(io, messageId),
  );
  socket.on("update_message", (data: UpdateMessagePayload) =>
    updateMessage(io, data),
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
  if (!room) return;

  await room.resetUnreadMessages(socket.userId);
  socket.emit("unread_reset", { room_id: roomId });
};

const sendMessage = async (
  io: Server,
  socket: AuthedSocket,
  { room_id, text }: SendMessagePayload,
): Promise<void> => {
  const room = await RoomRepository.findRoomById(room_id);
  if (!room || room.is_deleted) return;

  const { one, two } = room.participants;
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
    room_id,
    sender_id: senderId,
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
  if (!message) return;

  message.text = decryptChatText(message.text);
  const room_id = message.room_id.toString();

  const lastMessage = await ChatRepository.findLatestMessage(room_id);
  if (lastMessage) lastMessage.text = decryptChatText(lastMessage.text);

  await message.deleteMessage();

  io.to(room_id).emit("message_deleted", messageId);

  // Only update last message preview if the deleted message was the latest
  const wasLatest = lastMessage?._id.toString() === messageId;
  if (!wasLatest) return;

  const room = await RoomRepository.findRoomById(room_id);
  const { one, two } = room.participants;
  const recipientId = resolveRecipient(
    message.sender_id.toString(),
    one._id.toString(),
    two._id.toString(),
  );

  const previousMessage = await ChatRepository.findLatestMessage(room_id);
  if (previousMessage)
    previousMessage.text = decryptChatText(previousMessage.text);

  const lastMessagePayload: LastMessagePayload = previousMessage
    ? {
        room_id,
        text: previousMessage.text,
        sender_id: previousMessage.sender_id.toString(),
        timestamp: previousMessage.createdAt,
        unread_count: room.unread_messages.get(recipientId) ?? 0,
      }
    : { room_id, text: "", sender_id: null, timestamp: null, unread_count: 0 };

  await room.updateLastMessage(
    lastMessagePayload.text,
    lastMessagePayload.sender_id as string,
  );

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
  if (!message) return;

  const room_id = message.room_id.toString();

  await message.updateMessage(updated_text);
  io.to(room_id).emit("message_updated", { message_id, text: updated_text });

  const lastMessage = await ChatRepository.findLatestMessage(room_id);
  if (!lastMessage || lastMessage._id.toString() !== message_id) return;

  const room = await RoomRepository.findRoomById(room_id);
  const { one, two } = room.participants;
  const recipientId = resolveRecipient(
    message.sender_id.toString(),
    one._id.toString(),
    two._id.toString(),
  );

  await room.updateLastMessage(updated_text, message.sender_id.toString());

  const lastMessagePayload: LastMessagePayload = {
    room_id,
    text: updated_text,
    sender_id: message.sender_id.toString(),
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

const isUserInRoom = async (
  io: Server,
  roomId: string,
  userId: string,
): Promise<boolean> => {
  const sockets = await io.in(roomId).fetchSockets();
  return sockets.some((s) => (s as unknown as AuthedSocket).userId === userId);
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
