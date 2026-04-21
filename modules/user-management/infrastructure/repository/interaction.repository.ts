import { Types } from "mongoose";

import Interaction, {
  TInteraction,
} from "../../domain/models/interaction/interaction.model";

const findMatch = async (
  from: Types.ObjectId | string,
  to: Types.ObjectId | string,
) => {
  return Interaction.findOne({
    $or: [
      { from, to, type: "like" },
      { from: to, to: from, type: "like" },
    ],
  });
};

const findUserInteractions = async (userID: Types.ObjectId | string) => {
  return Interaction.find({
    $or: [{ from: userID }, { to: userID, type: "match" }],
  });
};

const findInteractionsOnUser = async (userID: Types.ObjectId | string) => {
  return Interaction.find({ to: userID, type: "like" })
    .populate("from")
    .populate("comment.glimpse");
};

const createInteraction = async (payload: Partial<TInteraction>) => {
  const interaction = new Interaction(payload);
  return interaction.save();
};

const bulkCreateInteraction = async (payloads: Partial<TInteraction>[]) => {
  return Interaction.insertMany(payloads);
};

export const InteractionRepository = {
  findMatch,
  findUserInteractions,
  findInteractionsOnUser,
  createInteraction,
  bulkCreateInteraction,
};
