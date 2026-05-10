import mongoose, { Schema, InferSchemaType, HydratedDocument } from "mongoose";
import mongooseDelete, { SoftDeleteModel } from "mongoose-delete";
import { getUserDbConnection } from "../../../../../shared/database";

import {
  Orientation,
  Gender,
  CoreActivities,
  MediaConsumption,
  Lifestyle,
  DatingPreferences,
} from "./enum";

// ─── Schema Definition ───────────────────────────────────────────────────────

const userSchema = new Schema(
  {
    uid: { type: String, required: true, unique: true },
    name: { type: String, default: null },
    email: { type: String, default: null },
    dob: { type: Date, default: null },

    place_of_birth: {
      latitude: { type: Number },
      longitude: { type: Number },
    },

    gender: {
      type: String,
      enum: Object.values(Gender),
      default: null,
    },

    orientation: {
      type: String,
      enum: Object.values(Orientation),
      default: null,
    },

    bio: { type: String, maxlength: 500, default: "" },

    location: {
      type: { type: String, enum: ["Point"] as const, default: "Point" },
      coordinates: { type: [Number], default: [0, 0] },
    },

    prompts: {
      type: [
        {
          question: { type: String, default: "" },
          answer: { type: String, default: "" },
        },
      ],
      default: [],
    },

    interests: {
      coreActivities: {
        type: [String],
        enum: Object.values(CoreActivities),
        default: [],
      },
      mediaConsumption: {
        type: [String],
        enum: Object.values(MediaConsumption),
        default: [],
      },
      lifestyle: {
        type: [String],
        enum: Object.values(Lifestyle),
        default: [],
      },
      datingPreferences: {
        type: [String],
        enum: Object.values(DatingPreferences),
        default: [],
      },
    },

    event: { type: String, default: null },

    persona: {
      type: String,
      default:
        "https://cdn.prod.website-files.com/5e51c674258ffe10d286d30a/5e535421d399233b9b529696_peep-28.svg",
    },

    isActive: { type: Boolean, default: true },
    lastActive: { type: Date, default: Date.now },
    isProfileComplete: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  },
);

// ─── Inferred Types ───────────────────────────────────────────────────────────

// The source-of-truth type — derived directly from the schema, no duplication
export type TUser = InferSchemaType<typeof userSchema>;

// A fully hydrated document (includes _id, save(), etc.)
export type UserDocument = HydratedDocument<TUser>;

// ─── Indexes ─────────────────────────────────────────────────────────────────

userSchema.index({ location: "2dsphere" });

// ─── Instance Methods ─────────────────────────────────────────────────────────

// Augment the schema methods with proper types
userSchema.methods.markAsCompleted = function (
  this: UserDocument,
): Promise<UserDocument> {
  this.isProfileComplete = true;
  return this.save();
};

// ─── Soft Delete Plugin ───────────────────────────────────────────────────────

userSchema.plugin(mongooseDelete, { deletedAt: true, overrideMethods: "all" });

// ─── Model ───────────────────────────────────────────────────────────────────

// Cast to SoftDeleteModel to expose .findDeleted(), .restore(), etc.
const userDb = getUserDbConnection();

type SoftDeleteUserModel = SoftDeleteModel<UserDocument>;

const User =
  (userDb.models.User as SoftDeleteUserModel) ||
  userDb.model("User", userSchema as Schema<UserDocument>);

export default User;
