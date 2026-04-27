// ─── event/user-profile-update/user-profile-update.event.ts ─────────────────

import { RoomRepository } from "../../infrastructure/repository";
import { getIO } from "../../infrastructure/socket";
import { ObjectId } from "mongoose";

interface UserProfileUpdatePayload {
  _id: ObjectId;
  name: string;
  persona: string;
}

export const handleUserProfileUpdate = async (
  data: UserProfileUpdatePayload,
): Promise<void> => {
  const rooms = await RoomRepository.findRooms({
    $or: [
      { "participants.one._id": data._id },
      { "participants.two._id": data._id },
    ],
  });

  if (rooms.length === 0) return;

  await Promise.all(
    rooms.map((room) => room.updateParticipantPersona(data._id, data.persona)),
  );

  const io = getIO();

  rooms.forEach((room) => {
    const { one, two } = room.participants;
    const partner = one._id.toString() === data._id.toString() ? two : one;

    io.to(partner._id.toString()).emit("partner_profile_update", {
      room_id: room._id,
      partner: {
        _id: data._id.toString(),
        name: data.name,
        persona: data.persona,
      },
    });
  });
};
