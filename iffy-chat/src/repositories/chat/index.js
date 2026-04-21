const Chat = require("../../models/chat");
const mongoose = require("mongoose");

const findChats = async (criteria) => {
  const { room_id, limit, skip } = criteria;
  return await Chat.aggregate([
    { $match: { room_id: new mongoose.Types.ObjectId(room_id) } },
    {
      $facet: {
        chats: [
          { $sort: { createdAt: -1 } },
          { $skip: skip },
          { $limit: limit },
        ],
        total: [{ $count: "count" }],
      },
    },
  ]);
};

const findChatById = async (chatId) => {
  return await Chat.findOne({ _id: chatId });
};

const createChat = async ({ room_id, sender_id, text }) => {
  const chat = new Chat({ room_id, sender_id, text });
  return await chat.save();
};

const findLatestMessage = async (room_id) => {
  return await Chat.findOne({ room_id }).sort({ createdAt: -1 });
};

module.exports = {
  findChats,
  findChatById,
  createChat,
  findLatestMessage,
};
