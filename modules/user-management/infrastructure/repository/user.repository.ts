import { FilterQuery, ProjectionType, Types } from "mongoose";
import User, { TUser, UserDocument } from "../../domain/models/user/user.model";

// ─── Types ────────────────────────────────────────────────────────────────────

type UserFields = ProjectionType<TUser>;

interface PaginatedCriteria extends FilterQuery<UserDocument> {
  limit: number;
  skip: number;
}

interface PromptInput {
  question: string;
  answer: string;
}

// ─── Finders ─────────────────────────────────────────────────────────────────

const findByUID = async (uid: string): Promise<UserDocument | null> => {
  return User.findOne({ uid });
};

const findById = async (
  userID: Types.ObjectId | string,
  fields?: UserFields,
): Promise<Partial<TUser> | null> => {
  return User.findById(userID)
    .select(fields ? `${fields} -_id` : "")
    .lean();
};

const getFilteredUsers = async (
  criteria: PaginatedCriteria,
): Promise<UserDocument[]> => {
  const { limit, skip } = criteria;
  const {
    limit: _l,
    skip: _s,
    ...rest
  } = criteria as unknown as Record<string, unknown>;
  const filters = rest as FilterQuery<TUser>;

  // TS: Mongoose query overloads can be fragile with complex schema-derived
  // filter types (especially maps / subdocument arrays). Narrowing to
  // `any` here keeps the call safe at runtime while keeping the repository
  // surface typed. This is a narrow, intentional assertion.
  return User.find(filters as unknown as any)
    .limit(limit)
    .skip(skip);
};

// ─── Prompt Finders ───────────────────────────────────────────────────────────

const findPromptById = async (
  userID: Types.ObjectId | string,
  promptID: Types.ObjectId | string,
): Promise<Partial<TUser> | null> => {
  return User.findOne(
    { _id: userID, "prompts._id": promptID },
    { "prompts.$": 1 },
  );
};

// ─── Mutations ────────────────────────────────────────────────────────────────

const create = async (userData: Partial<TUser>): Promise<UserDocument> => {
  const user = new User(userData);
  return user.save();
};

const updateUserDetails = async (
  userID: Types.ObjectId | string,
  details: Partial<TUser>,
) => {
  return User.updateOne({ _id: userID }, { $set: details });
};

const deleteUser = async (userID: Types.ObjectId | string) => {
  return User.delete({ _id: userID });
};

// ─── Prompt Mutations ─────────────────────────────────────────────────────────

const addBulkPrompts = async (
  userID: Types.ObjectId | string,
  prompts: PromptInput[],
) => {
  return User.updateOne(
    { _id: userID },
    { $push: { prompts: { $each: prompts } } },
  );
};

const updatePrompt = async (
  userID: Types.ObjectId | string,
  promptID: Types.ObjectId | string,
  prompt: PromptInput,
) => {
  return User.updateOne(
    { _id: userID, "prompts._id": promptID },
    { $set: { "prompts.$": prompt } },
  );
};

const deletePrompt = async (
  userID: Types.ObjectId | string,
  promptID: Types.ObjectId | string,
) => {
  return User.updateOne(
    { _id: userID },
    { $pull: { prompts: { _id: promptID } } },
  );
};

// ─── Export ───────────────────────────────────────────────────────────────────

export const UserRepository = {
  findByUID,
  findById,
  getFilteredUsers,
  findPromptById,
  create,
  updateUserDetails,
  deleteUser,
  addBulkPrompts,
  updatePrompt,
  deletePrompt,
};
