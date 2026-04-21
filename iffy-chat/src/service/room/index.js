const { roomRepository } = require("../../repositories");
const { decryptChatText } = require("../../utils/chat-crypto");

const createChatRoomForMatchedUsers = async (roomId, participants) => {
  return await roomRepository.createRoom({ roomId, participants });
};

const getRoomById = async (roomId) => {
  return await roomRepository.findRoomById({ _id: roomId });
};

const getRoomsByUserId = async (userId) => {
  const rooms = await roomRepository.findRooms({
    $or: [
      { "participants.one._id": userId },
      { "participants.two._id": userId },
    ],
  });
  return rooms;
};

const getRooms = async (payload) => {
  const { userID } = payload.query;
  let criteria = {};

  criteria.$or = [
    { "participants.one._id": userID },
    { "participants.two._id": userID },
  ];

  const rooms = await roomRepository.findRooms(criteria);

  const response = rooms.map((room) => {
    const partner =
      room.participants.one._id.toString() === userID
        ? room.participants.two
        : room.participants.one;
    return {
      _id: room._id,
      partner,
      lastMessage: {
        ...room.last_message,
        text: decryptChatText(room.last_message?.text),
      },
      unreadCount: room.unread_messages.get(userID.toString()) || 0,
      isDeleted: room.is_deleted,
    };
  });

  return response;
};

module.exports = {
  createChatRoomForMatchedUsers,
  getRooms,
  getRoomById,
  getRoomsByUserId,
};
