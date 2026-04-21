const Room = require("../../models/room");

const createRoom = async ({ roomId, participants }) => {
  const room = new Room({ _id: roomId, participants });
  return await room.save();
};

const findRoomById = async (roomId) => {
  return await Room.findOne({ _id: roomId });
};

const findRooms = async (criteria) => {
  return await Room.find(criteria);
};

module.exports = { createRoom, findRooms, findRoomById };
