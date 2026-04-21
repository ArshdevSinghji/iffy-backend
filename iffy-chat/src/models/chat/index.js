const { default: mongoose } = require("mongoose");
const mongooseDelete = require("mongoose-delete");
const { encryptChatText } = require("../../utils/chat-crypto");

const chatSchema = mongoose.Schema(
  {
    room_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: true,
      index: true,
    },
    sender_id: {
      type: mongoose.Schema.Types.ObjectId,
      index: true,
    },
    text: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["sent", "delivered", "read"],
      default: "sent",
    },
  },
  { timestamps: true },
);

chatSchema.plugin(mongooseDelete, {
  deletedAt: true,
  overrideMethods: "all",
});

chatSchema.methods.deleteMessage = async function () {
  await this.delete();
};

chatSchema.methods.updateMessage = async function (updated_text) {
  this.text = encryptChatText(updated_text);
  await this.save();
};

module.exports = mongoose.model("Chat", chatSchema);
