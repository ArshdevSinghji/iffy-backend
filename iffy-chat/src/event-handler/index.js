const { roomService } = require("../service");
const { getIO } = require("../sockets");

exports.eventHandler = (data, key) => {
  switch (key) {
    case "user.profile.update":
      handleUserProfileUpdate(data);
      break;
    case "user.match.created":
      handleMatchEvent(data);
      break;
    case "user.profile.deleted":
      handleUserProfileDelete(data);
      break;
    default:
      console.log("Unhandled event key:", key);
  }
};

const handleUserProfileDelete = async (data) => {
  console.log(
    `[Profile Delete] User ${data._id} deleted profile, handling cleanup...`,
  );
  try {
    const rooms = await roomService.getRoomsByUserId(data._id);
    if (rooms.length === 0) {
      console.log(
        `No rooms found for user ${data._id}, skipping profile delete notifications.`,
      );
      return;
    }

    await Promise.all(
      rooms.map((room) => {
        return room.deleteRoom();
      }),
    );
  } catch (err) {
    console.error("Profile delete handling failed:", err);
  }
};

const handleUserProfileUpdate = async (data) => {
  try {
    const rooms = await roomService.getRoomsByUserId(data._id);
    if (rooms.length === 0) {
      console.log(
        `No rooms found for user ${data._id}, skipping profile update notifications.`,
      );
      return;
    }

    Promise.all(
      rooms.map((room) => {
        return room.updateParticipantPersona(data._id, data.persona);
      }),
    );

    const io = getIO();
    rooms.forEach((room) => {
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

    console.log(
      `[Profile Update] User ${data._id} updated profile, notified partners in rooms: ${rooms
        .map((r) => r._id)
        .join(", ")}`,
    );
  } catch (err) {
    console.error("Profile update handling failed:", err);
  }
};

const handleMatchEvent = async (data) => {
  try {
    await roomService.createChatRoomForMatchedUsers(
      data._id,
      data.participants,
    );

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

    console.log(`[Chat] Room ${data._id} ready for users ${data.participants}`);
  } catch (err) {
    console.error("Match processing failed:", err);
  }
};
