const { chatService, roomService } = require("../../service");

module.exports = (io, socket) => {
  socket.on("join_room", async (roomId) => {
    socket.join(roomId);

    try {
      const room = await roomService.getRoomById(roomId);
      if (room) {
        await room.resetUnreadMessages(socket.userId);
        socket.emit("unread_reset", { room_id: roomId });
      }
    } catch (err) {
      console.error("Join room reset error:", err);
    }

    console.log(`Socket ${socket.id} joined room ${roomId}`);
  });

  socket.on("send_message", async (data) => {
    const { room_id, text } = data;
    const sender_id = socket.userId;

    try {
      const room = await roomService.getRoomById(room_id);
      if (!room) {
        console.log(`Room ${room_id} not found for message sending`);
        return;
      }

      if (room.is_deleted) {
        console.log(
          `Attempt to send message to deleted room ${room_id} ignored`,
        );
        return;
      }

      const { one, two } = room.participants;
      const recipient_id =
        one._id.toString() === sender_id
          ? two._id.toString()
          : one._id.toString();

      const activeSocketsInRoom = await io.in(room_id).fetchSockets();
      const isRecipientActive = activeSocketsInRoom.some(
        (s) => s.userId === recipient_id,
      );

      await room.updateLastMessage(text, sender_id);

      if (!isRecipientActive) {
        const recipient = one._id.toString() === sender_id ? two : one;
        io.to(recipient_id).emit("notification", recipient);
        await room.incrementUnreadMessages(recipient_id);
      }

      const savedMessage = await chatService.createChatMessage(
        room_id,
        sender_id,
        text,
      );

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
    } catch (err) {
      console.error("Failed message process:", err);
    }
  });

  socket.on("delete_message", async (message_id) => {
    try {
      const message = await chatService.getChatById(message_id);
      if (!message) return;
      const room_id = message.room_id.toString();

      const lastMessage = await chatService.getLatestMessage(room_id);

      await message.deleteMessage();

      if (lastMessage && lastMessage._id.toString() === message_id) {
        const room = await roomService.getRoomById(message.room_id);
        const previousMessage = await chatService.getLatestMessage(room_id);
        let messagePayload = {};
        if (previousMessage) {
          messagePayload = {
            text: previousMessage.text,
            sender_id: previousMessage.sender_id,
            timestamp: previousMessage.createdAt,
          };
          await room.updateLastMessage(
            previousMessage.text,
            previousMessage.sender_id,
            previousMessage.createdAt,
          );
        } else {
          messagePayload = {
            text: "",
            sender_id: null,
            timestamp: null,
          };
          await room.updateLastMessage("", null, null);
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
      console.log(`Message ${message_id} deleted from room ${message.room_id}`);
    } catch (err) {
      console.error("Delete message error:", err);
    }
  });

  socket.on("update_message", async ({ message_id, updated_text }) => {
    try {
      const message = await chatService.getChatById(message_id);
      if (!message) return;
      const room_id = message.room_id.toString();

      await message.updateMessage(updated_text);

      const lastMessage = await chatService.getLatestMessage(room_id);
      if (lastMessage && lastMessage._id.toString() === message_id) {
        const room = await roomService.getRoomById(message.room_id);
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
    } catch (err) {
      console.error("Update message error:", err);
    }
  });

  socket.on("leave_room", (room_id) => {
    socket.leave(room_id);
    console.log(`Socket ${socket.id} left room ${room_id}`);
  });
};
