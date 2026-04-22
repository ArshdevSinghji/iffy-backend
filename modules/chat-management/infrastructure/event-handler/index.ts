import { RoomRepository } from "../repository";
import { getIO } from "../socket";

export const eventHandler = (data: any, key: string) => {
  switch (key) {
    case "user.profile.update":
      void handleUserProfileUpdate(data);
      break;
    case "user.match.created":
      void handleMatchEvent(data);
      break;
    case "user.profile.deleted":
      void handleUserProfileDelete(data);
      break;
    default:
      console.log("Unhandled event key:", key);
  }
};

const handleUserProfileDelete = async (data: { _id: string }) => {
  const rooms = await RoomRepository.findRooms({
    $or: [
      { "participants.one._id": data._id },
      { "participants.two._id": data._id },
    ],
  });

  if (rooms.length === 0) {
    return;
  }

  await Promise.all(rooms.map((room: any) => room.deleteRoom()));
};

const handleUserProfileUpdate = async (data: {
  _id: string;
  name: string;
  persona: string;
}) => {
  const rooms = await RoomRepository.findRooms({
    $or: [
      { "participants.one._id": data._id },
      { "participants.two._id": data._id },
    ],
  });

  if (rooms.length === 0) {
    return;
  }

  await Promise.all(
    rooms.map((room: any) =>
      room.updateParticipantPersona(data._id, data.persona),
    ),
  );

  const io = getIO();
  rooms.forEach((room: any) => {
    const partner =
      room.participants.one._id.toString() === data._id
        ? room.participants.two
        : room.participants.one;

    io.to(partner._id.toString()).emit("partner_profile_update", {
      room_id: room._id,
      partner: {
        _id: data._id,
        name: data.name,
        persona: data.persona,
      },
    });
  });
};

const handleMatchEvent = async (data: {
  _id: string;
  participants: {
    one: { _id: string; name: string; persona?: string };
    two: { _id: string; name: string; persona?: string };
  };
}) => {
  await RoomRepository.createRoom({
    roomId: data._id,
    participants: data.participants,
  });

  const io = getIO();
  const { one, two } = data.participants;
  io.to(one._id.toString()).emit("new_match", {
    roomId: data._id,
    partner: two,
  });
  io.to(two._id.toString()).emit("new_match", {
    roomId: data._id,
    partner: one,
  });
};
