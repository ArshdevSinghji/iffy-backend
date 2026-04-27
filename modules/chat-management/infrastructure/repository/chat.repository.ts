import mongoose, { Types } from "mongoose";

import Chat, { TChat, ChatDocument } from "../../domain/models/chat";

interface FindChatsParams {
  room_id: Types.ObjectId | string;
  limit: number;
  skip: number;
}

interface PaginatedChats {
  chats: TChat[];
  total: { count: number }[];
}

class ChatRepositoryClass {
  async findChats({
    room_id,
    limit,
    skip,
  }: FindChatsParams): Promise<PaginatedChats[]> {
    return Chat.aggregate([
      { $match: { room_id: new Types.ObjectId(room_id) } },
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
  }

  async findChatById(chatId: string): Promise<ChatDocument | null> {
    return Chat.findOne({ _id: chatId });
  }

  async createChat(payload: Partial<TChat>): Promise<ChatDocument> {
    const chat = new Chat(payload);
    return chat.save();
  }

  async findLatestMessage(
    room_id: Types.ObjectId | string,
  ): Promise<ChatDocument | null> {
    return Chat.findOne({ room_id }).sort({ createdAt: -1 });
  }
}

export const ChatRepository = new ChatRepositoryClass();
