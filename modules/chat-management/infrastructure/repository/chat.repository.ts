import mongoose from "mongoose";

import Chat, { ChatDocument, TChat } from "../../domain/models/chat";

const findChats = async (criteria: {
  room_id: string;
  limit: number;
  skip: number;
}) => {
  const { room_id, limit, skip } = criteria;

  return Chat.aggregate([
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

const findChatById = async (chatId: string) => {
  return Chat.findOne({ _id: chatId });
};

const createChat = async (payload: Partial<TChat>) => {
  const chat = new Chat(payload);
  return chat.save();
};

const findLatestMessage = async (room_id: string) => {
  return Chat.findOne({ room_id }).sort({ createdAt: -1 });
};

export const ChatRepository = {
  findChats,
  findChatById,
  createChat,
  findLatestMessage,
};

export type { ChatDocument };
