import { FilterQuery } from "mongoose";
import type { ObjectId } from "mongodb";

import Room, { TRoom, RoomDocument } from "../../domain/models/room";

class RoomRepositoryClass {
  async createRoom({
    roomId,
    participants,
  }: {
    roomId: ObjectId;
    participants: TRoom["participants"];
  }): Promise<RoomDocument> {
    const room = new Room({ _id: roomId, participants });
    return room.save();
  }

  async findRoomById(roomId: ObjectId | string): Promise<RoomDocument | null> {
    return Room.findOne({ _id: roomId });
  }

  async findRooms(criteria: FilterQuery<TRoom>): Promise<RoomDocument[]> {
    return Room.find(criteria);
  }
}

export const RoomRepository = new RoomRepositoryClass();