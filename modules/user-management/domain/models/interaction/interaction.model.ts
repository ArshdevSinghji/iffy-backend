import mongoose, { Schema, InferSchemaType, HydratedDocument } from "mongoose";
import { getUserDbConnection } from "../../../../../shared/database";

// ─── Schema Definition ────────────────────────────────────────────────────────

const interactionSchema = new Schema({
  from: { type: Schema.Types.ObjectId, ref: "User", required: true },
  to: { type: Schema.Types.ObjectId, ref: "User", required: true },

  type: {
    type: String,
    enum: ["like", "dislike", "match"] as const,
    required: true,
  },

  comment: {
    glimpse: { type: Schema.Types.ObjectId, ref: "Glimpse" },
    prompt: {
      question: { type: String },
      answer: { type: String },
    },
    answer: { type: String },
  },

  createdAt: { type: Date, default: Date.now },
});

// ─── Inferred Types ───────────────────────────────────────────────────────────

export type TInteraction = InferSchemaType<typeof interactionSchema>;
export type InteractionDocument = HydratedDocument<TInteraction>;

// ─── Instance Methods ─────────────────────────────────────────────────────────

interactionSchema.methods.markAsMatch = function (
  this: InteractionDocument,
): Promise<InteractionDocument> {
  this.type = "match";
  return this.save();
};

// ─── Model ───────────────────────────────────────────────────────────────────

const userDb = getUserDbConnection();

const Interaction =
  userDb.models.Interaction ||
  userDb.model<TInteraction>("Interaction", interactionSchema);

export default Interaction;
