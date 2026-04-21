const Interaction = require("../../models/interaction");

async function findMatch(from, to) {
  return await Interaction.findOne({
    $or: [
      { from, to, type: "like" },
      { from: to, to: from, type: "like" },
    ],
  });
}

async function findUserInteractions(userID) {
  let criteria = {};
  criteria.$or = [{ from: userID }, { to: userID, type: "match" }];
  return await Interaction.find(criteria);
}

async function findInteractionsOnUser(userID) {
  return await Interaction.find({ to: userID, type: "like" }).populate("from").populate("comment.glimpse");
}

async function createInteraction(payload) {
  const interaction = new Interaction(payload);
  return await interaction.save();
}

async function bulkCreateInteraction(payloads) {
  return await Interaction.insertMany(payloads);
}

module.exports = {
  createInteraction,
  bulkCreateInteraction,
  findUserInteractions,
  findInteractionsOnUser,
  findMatch,
};
