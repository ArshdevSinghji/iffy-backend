const Glimpse = require("../../models/glimpses");

const findGlimpses = async (userID) => {
  return await Glimpse.find({ userID });
};

const createGlimpse = async (payload) => {
  const glimpse = new Glimpse(payload);
  return await glimpse.save();
};

const findGlimpseById = async (userID, glimpseID) => {
  return await Glimpse.findOne({ _id: glimpseID, userID });
};

const deleteGlimpse = async (userID, glimpseID) => {
  return await Glimpse.delete({ _id: glimpseID, userID });
};

const findGlimpsesByUserIDs = async (userIDs) => {
  return await Glimpse.find({ userID: { $in: userIDs } });
};

module.exports = {
  findGlimpses,
  createGlimpse,
  findGlimpseById,
  deleteGlimpse,
  findGlimpsesByUserIDs,
};
