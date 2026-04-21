const User = require("../../models/user");

const findByUserID = async (userID) => {
  return await User.findOne({ userID });
};

const findById = async (userID, fields) => {
  return await User.findById({ _id: userID }).select(fields).lean();
};

const getFilteredUsers = async (criteria) => {
  const { limit, skip, ...filters } = criteria;
  return await User.find(filters).limit(limit).skip(skip);
};

const create = async (userData) => {
  const user = new User(userData);
  return await user.save();
};

const updateUserDetails = async (userID, details) => {
  return await User.updateOne({ _id: userID }, { $set: details });
};

const findPromptById = async (userID, promptID) => {
  return await User.findOne(
    { _id: userID, "prompts._id": promptID },
    { "prompts.$": 1 },
  );
};

const updatePrompt = async (userID, promptID, prompts) => {
  return await User.updateOne(
    { _id: userID, "prompts._id": promptID },
    { $set: { "prompts.$": prompts } },
  );
};

const deletePrompt = async (userID, promptID) => {
  return await User.updateOne(
    { _id: userID },
    { $pull: { prompts: { _id: promptID } } },
  );
};

const addBulkPrompts = async (userID, prompts) => {
  return await User.updateOne(
    { _id: userID },
    { $push: { prompts: { $each: prompts } } },
  );
};

const deleteUser = async (userID) => {
  return await User.delete({ _id: userID });
};

module.exports = {
  findByUserID,
  create,
  updateUserDetails,
  findById,
  getFilteredUsers,
  addBulkPrompts,
  findPromptById,
  updatePrompt,
  deletePrompt,
  deleteUser,
};
