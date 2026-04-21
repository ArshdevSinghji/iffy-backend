const mongoose = require("mongoose");
const mongooseDelete = require("mongoose-delete");

const glimpseSchema = new mongoose.Schema(
  {
    userID: {
      type: mongoose.Schema.Types.ObjectId,
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
      maxLength: 100
    },
  },
  { timestamps: true },
);

glimpseSchema.plugin(mongooseDelete, {
  deletedAt: true,
  overrideMethods: "all",
});

const Glimpse = mongoose.model("Glimpse", glimpseSchema);

module.exports = Glimpse;
