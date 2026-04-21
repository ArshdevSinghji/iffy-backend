const mongoose = require("mongoose");
const { encryptChatText } = require("../../utils/chat-crypto");

const roomSchema = new mongoose.Schema(
  {
    _id: { type: mongoose.Schema.Types.ObjectId },
    participants: {
      one: {
        _id: { type: mongoose.Schema.Types.ObjectId },
        name: { type: String },
        persona: { type: String },
      },
      two: {
        _id: { type: mongoose.Schema.Types.ObjectId },
        name: { type: String },
        persona: { type: String },
      },
    },
    last_message: {
      text: { type: String },
      sender_id: { type: mongoose.Schema.Types.ObjectId },
      timestamp: { type: Date },
    },
    unread_messages: {
      type: Map,
      of: Number,
      default: {},
    },
    is_deleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

roomSchema.methods.updateLastMessage = function (text, sender_id) {
  this.last_message = {
    text: encryptChatText(text),
    sender_id,
    timestamp: new Date(),
  };
  return this.save();
};

roomSchema.methods.incrementUnreadMessages = function (userId) {
  const currentCount = this.unread_messages.get(userId.toString()) || 0;
  this.unread_messages.set(userId.toString(), currentCount + 1);
  return this.save();
};

roomSchema.methods.decrementUnreadMessages = function (userId) {
  const currentCount = this.unread_messages.get(userId.toString()) || 0;
  const newCount = Math.max(currentCount - 1, 0);
  this.unread_messages.set(userId.toString(), newCount);
  return this.save();
};

roomSchema.methods.resetUnreadMessages = function (userId) {
  this.unread_messages.set(userId.toString(), 0);
  return this.save();
};

roomSchema.methods.updateParticipantPersona = function (userId, persona) {
  if (this.participants.one._id.toString() === userId.toString()) {
    this.participants.one.persona = persona;
  } else if (this.participants.two._id.toString() === userId.toString()) {
    this.participants.two.persona = persona;
  }
  return this.save();
};

roomSchema.methods.deleteRoom = function () {
  this.is_deleted = true;
  return this.save();
};

module.exports = mongoose.model("Room", roomSchema);
