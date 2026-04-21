import { Types } from "mongoose";

import Glimpse, { TGlimpse } from "../../domain/models/glimpses/glimpses.model";

const findGlimpses = async (userID: Types.ObjectId | string) => {
  return Glimpse.find({ userID });
};

const createGlimpse = async (payload: Partial<TGlimpse>) => {
  const glimpse = new Glimpse(payload);
  return glimpse.save();
};

const findGlimpseById = async (
  userID: Types.ObjectId | string,
  glimpseID: Types.ObjectId | string,
) => {
  return Glimpse.findOne({ _id: glimpseID, userID });
};

const deleteGlimpse = async (
  userID: Types.ObjectId | string,
  glimpseID: Types.ObjectId | string,
) => {
  return Glimpse.delete({ _id: glimpseID, userID });
};

const findGlimpsesByUserIDs = async (
  userIDs: Array<Types.ObjectId | string>,
) => {
  return Glimpse.find({ userID: { $in: userIDs } });
};

export const GlimpseRepository = {
  findGlimpses,
  createGlimpse,
  findGlimpseById,
  deleteGlimpse,
  findGlimpsesByUserIDs,
};
