import Room, { TRoom } from "../../domain/models/room";

const createRoom = async ({
  roomId,
  participants,
}: {
  roomId: string;
  participants: TRoom["participants"];
}) => {
  const room = new Room({ _id: roomId, participants });
  return room.save();
};

const findRoomById = async (roomId: string) => {
  return Room.findOne({ _id: roomId });
};

const findRooms = async (criteria: Record<string, unknown>) => {
  return Room.find(criteria);
};

export const RoomRepository = {
  createRoom,
  findRoomById,
  findRooms,
};
