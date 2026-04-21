const mongoose = require("mongoose");

const interactionSchema = new mongoose.Schema({
  from: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  to: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type: {
    type: String,
    enum: ["like", "dislike", "match"],
    required: true,
  },
  comment: {
    glimpse: { type: mongoose.Schema.Types.ObjectId, ref: "Glimpse" },
    prompt: {
      question: { type: String },
      answer: { type: String },
    },
    answer: { type: String },
  },
  createdAt: { type: Date, default: Date.now },
});

interactionSchema.methods.markAsMatch = function () {
  this.type = "match";
  return this.save();
};

module.exports = mongoose.model("Interaction", interactionSchema);
