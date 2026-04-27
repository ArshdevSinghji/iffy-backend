// ─── event/user-profile-deleted/user-profile-deleted.event.ts ───────────────

import { RoomRepository } from "../../infrastructure/repository";
import { ObjectId } from "mongoose";

interface UserProfileDeletedPayload {
  _id: ObjectId;
}

export const handleUserProfileDeleted = async (
  data: UserProfileDeletedPayload,
): Promise<void> => {
  const rooms = await RoomRepository.findRooms({
    $or: [
      { "participants.one._id": data._id },
      { "participants.two._id": data._id },
    ],
  });

  if (rooms.length === 0) return;

  await Promise.all(rooms.map((room) => room.deleteRoom()));
};
