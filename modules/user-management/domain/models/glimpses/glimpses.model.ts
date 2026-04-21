import mongoose, { Schema, InferSchemaType, HydratedDocument } from "mongoose";
import mongooseDelete, { SoftDeleteModel } from "mongoose-delete";

// ─── Schema Definition ────────────────────────────────────────────────────────

const glimpseSchema = new Schema(
  {
    userID: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
      index: true,
    },
    imageURL: {
      type: String,
      required: true,
    },
    caption: {
      type: String,
      maxlength: 100,
    },
  },
  { timestamps: true },
);

// ─── Inferred Types ───────────────────────────────────────────────────────────

export type TGlimpse = InferSchemaType<typeof glimpseSchema>;
export type GlimpseDocument = HydratedDocument<TGlimpse>;

// ─── Soft Delete Plugin ───────────────────────────────────────────────────────

glimpseSchema.plugin(mongooseDelete, {
  deletedAt: true,
  overrideMethods: "all",
});

// ─── Model ───────────────────────────────────────────────────────────────────

const Glimpse = mongoose.model<TGlimpse, SoftDeleteModel<TGlimpse>>(
  "Glimpse",
  glimpseSchema,
);

export default Glimpse;
