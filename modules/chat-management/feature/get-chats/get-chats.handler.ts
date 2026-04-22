import { Request, Response } from "express";

import { catchErrors } from "../../../../shared/middleware";
import { ChatRepository } from "../../infrastructure/repository";
import { decryptChatText } from "../../utils";
import { getChatsSchema } from "./get-chats.validator";

export const getChatsHandler = catchErrors(
  async (req: Request, res: Response) => {
    const payload = getChatsSchema.parse({
      params: req.params,
      query: req.query,
      body: req.body,
    });

    const { roomId } = payload.params;
    const { limit = 10, page = 1 } = payload.query;

    const result = await ChatRepository.findChats({
      room_id: roomId,
      limit: Number(limit),
      skip: (Number(page) - 1) * Number(limit),
    });

    const chats = (result[0]?.chats || []).map((chat: { text: string }) => ({
      ...chat,
      text: decryptChatText(chat.text),
    }));
    const total = result[0]?.total?.length > 0 ? result[0].total[0].count : 0;

    res.status(200).json({ chats, total });
  },
);
