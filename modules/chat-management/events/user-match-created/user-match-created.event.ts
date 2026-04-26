// ─── event/user-match-created/user-match-created.event.ts ───────────────────

import { RoomRepository } from "../../infrastructure/repository";
import { getIO } from "../../infrastructure/socket";

interface Participant {
  _id: string;
  name: string;
  persona?: string;
}

interface UserMatchCreatedPayload {
  _id: string;
  participants: {
    one: Participant;
    two: Participant;
  };
}

export const handleUserMatchCreated = async (
  data: UserMatchCreatedPayload,
): Promise<void> => {
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
