import { Server, Socket } from "socket.io";

import { ChatRepository, RoomRepository } from "../repository";
import { decryptChatText, encryptChatText } from "../../utils";

type SocketWithUserId = Socket & { userId: string };

const chatHandler = (io: Server, socket: SocketWithUserId) => {
  socket.on("join_room", async (roomId: string) => {
    socket.join(roomId);

    try {
      const room = await RoomRepository.findRoomById(roomId);
      if (room) {
        await room.resetUnreadMessages(socket.userId);
        socket.emit("unread_reset", { room_id: roomId });
      }
    } catch (error) {
      console.error("Join room reset error:", error);
    }
  });

  socket.on("send_message", async (data: { room_id: string; text: string }) => {
    const { room_id, text } = data;
    const sender_id = socket.userId;

    try {
      const room = await RoomRepository.findRoomById(room_id);
      if (!room || room.is_deleted) {
        return;
      }

      const { one, two } = room.participants;
      const recipient_id =
        one._id.toString() === sender_id
          ? two._id.toString()
          : one._id.toString();

      const activeSocketsInRoom = await io.in(room_id).fetchSockets();
      const isRecipientActive = activeSocketsInRoom.some(
        (s: any) => s.userId === recipient_id,
      );

      await room.updateLastMessage(text, sender_id);

      if (!isRecipientActive) {
        const recipient = one._id.toString() === sender_id ? two : one;
        io.to(recipient_id).emit("notification", recipient);
        await room.incrementUnreadMessages(recipient_id);
      }

      const savedMessage = await ChatRepository.createChat({
        room_id,
        sender_id,
        text: encryptChatText(text),
      });

      if (savedMessage) {
        savedMessage.text = text;
      }

      io.to(room_id).emit("receive_message", savedMessage);

      const message = {
        room_id,
        text,
        sender_id,
        timestamp: savedMessage.createdAt,
        unread_count: room.unread_messages.get(recipient_id) || 0,
      };

      io.to(one._id.toString()).emit("last_message_updated", message);
      io.to(two._id.toString()).emit("last_message_updated", message);
    } catch (error) {
      console.error("Failed message process:", error);
    }
  });

  socket.on("delete_message", async (message_id: string) => {
    try {
      const message = await ChatRepository.findChatById(message_id);
      if (!message) return;

      message.text = decryptChatText(message.text);

      const room_id = message.room_id.toString();
      const lastMessage = await ChatRepository.findLatestMessage(room_id);

      if (lastMessage) {
        lastMessage.text = decryptChatText(lastMessage.text);
      }

      await message.deleteMessage();

      if (lastMessage && lastMessage._id.toString() === message_id) {
        const room = await RoomRepository.findRoomById(
          message.room_id.toString(),
        );
        const previousMessage = await ChatRepository.findLatestMessage(room_id);
        if (previousMessage) {
          previousMessage.text = decryptChatText(previousMessage.text);
        }
        let messagePayload: Record<string, unknown> = {};

        if (previousMessage) {
          messagePayload = {
            text: previousMessage.text,
            sender_id: previousMessage.sender_id,
            timestamp: previousMessage.createdAt,
          };
          await room.updateLastMessage(
            previousMessage.text,
            previousMessage.sender_id,
          );
        } else {
          messagePayload = {
            text: "",
            sender_id: null,
            timestamp: null,
          };
          await room.updateLastMessage("", null as unknown as string);
        }

        const { one, two } = room.participants;
        const recipient_id =
          one._id.toString() === message.sender_id.toString()
            ? two._id.toString()
            : one._id.toString();

        const unreadCount = room.unread_messages.get(recipient_id) || 0;
        if (unreadCount > 0) {
          await room.decrementUnreadMessages(recipient_id);
        }

        messagePayload.unread_count =
          room.unread_messages.get(recipient_id) || 0;

        io.to(one._id.toString()).emit("last_message_updated", {
          room_id,
          ...messagePayload,
        });
        io.to(two._id.toString()).emit("last_message_updated", {
          room_id,
          ...messagePayload,
        });
      }

      io.to(room_id).emit("message_deleted", message_id);
    } catch (error) {
      console.error("Delete message error:", error);
    }
  });

  socket.on(
    "update_message",
    async ({
      message_id,
      updated_text,
    }: {
      message_id: string;
      updated_text: string;
    }) => {
      try {
        const message = await ChatRepository.findChatById(message_id);
        if (!message) return;

        message.text = decryptChatText(message.text);

        const room_id = message.room_id.toString();
        await message.updateMessage(updated_text);

        const lastMessage = await ChatRepository.findLatestMessage(room_id);
        if (lastMessage) {
          lastMessage.text = decryptChatText(lastMessage.text);
        }
        if (lastMessage && lastMessage._id.toString() === message_id) {
          const room = await RoomRepository.findRoomById(
            message.room_id.toString(),
          );
          await room.updateLastMessage(updated_text, message.sender_id);

          const { one, two } = room.participants;
          const recipient_id =
            one._id.toString() === message.sender_id.toString()
              ? two._id.toString()
              : one._id.toString();

          const messagePayload = {
            text: updated_text,
            sender_id: message.sender_id,
            timestamp: lastMessage.createdAt,
            unread_count: room.unread_messages.get(recipient_id) || 0,
          };

          io.to(one._id.toString()).emit("last_message_updated", {
            room_id,
            ...messagePayload,
          });
          io.to(two._id.toString()).emit("last_message_updated", {
            room_id,
            ...messagePayload,
          });
        }

        io.to(room_id).emit("message_updated", {
          message_id,
          text: updated_text,
        });
      } catch (error) {
        console.error("Update message error:", error);
      }
    },
  );

  socket.on("leave_room", (room_id: string) => {
    socket.leave(room_id);
  });
};

export default chatHandler;
