const mongoose = require("mongoose");
const mongooseDelete = require("mongoose-delete");
const {
  Orientation,
  Gender,
  CoreActivities,
  MediaConsumption,
  Lifestyle,
  DatingPreferences,
} = require("./enum");

const userSchema = new mongoose.Schema(
  {
    userID: { type: String, required: true, unique: true },
    name: { type: String, default: null },
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
    bio: { type: String, maxLength: 500, default: "" },

    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
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

userSchema.index({ location: "2dsphere" });

userSchema.methods.markAsCompleted = function () {
  this.isProfileComplete = true;
  return this.save();
};

userSchema.plugin(mongooseDelete, { deletedAt: true, overrideMethods: "all" });

module.exports = mongoose.model("User", userSchema);
