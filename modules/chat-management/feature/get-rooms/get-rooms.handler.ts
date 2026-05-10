import { Request, Response } from "express";

import { catchErrors } from "../../../../shared/middleware";
import { RoomRepository } from "../../infrastructure/repository";
import { decryptChatText } from "../../utils";
import { getRoomsSchema } from "./get-rooms.validator";

export const getRoomsHandler = catchErrors(
  async (req: Request, res: Response) => {
    const payload = getRoomsSchema.parse({
      params: req.params,
      query: req.query,
    });

    const rooms = await RoomRepository.findRooms({
      $or: [
        { "participants.one._id": payload.query.userID },
        { "participants.two._id": payload.query.userID },
      ],
    });

    const response = rooms.map((room: any) => {
      const partner =
        room.participants.one._id.toString() === payload.query.userID
          ? room.participants.two
          : room.participants.one;

      return {
        _id: room._id,
        partner,
        lastMessage: {
          ...room.last_message,
          text: room.last_message?.text
            ? decryptChatText(room.last_message.text)
            : "",
        },
        unreadCount:
          room.unread_messages.get(payload.query.userID.toString()) || 0,
        isDeleted: room.is_deleted,
      };
    });

    res.status(200).json(response);
  },
);
