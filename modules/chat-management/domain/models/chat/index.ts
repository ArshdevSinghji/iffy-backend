import mongoose, { HydratedDocument, Schema, InferSchemaType } from "mongoose";
import mongooseDelete, { SoftDeleteModel } from "mongoose-delete";
import { getChatDbConnection } from "../../../../../shared/database";

import { encryptChatText } from "../../../utils/chat-crypto";

const chatSchema = new Schema(
  {
    room_id: {
      type: Schema.Types.ObjectId,
      ref: "Room",
      required: true,
      index: true,
    },
    sender_id: {
      type: Schema.Types.ObjectId,
      index: true,
    },
    text: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["sent", "delivered", "read"] as const,
      default: "sent",
    },
  },
  { timestamps: true },
);

export type TChat = InferSchemaType<typeof chatSchema>;
type ChatMethods = {
  deleteMessage: () => Promise<unknown>;
  updateMessage: (updatedText: string) => Promise<unknown>;
};

export type ChatDocument = HydratedDocument<TChat> & ChatMethods;

chatSchema.plugin(mongooseDelete, {
  deletedAt: true,
  overrideMethods: "all",
});

chatSchema.methods.deleteMessage = function (this: ChatDocument) {
  return this.delete();
};

chatSchema.methods.updateMessage = function (
  this: ChatDocument,
  updatedText: string,
) {
  this.text = encryptChatText(updatedText);
  return this.save();
};

const chatDb = getChatDbConnection();

const Chat =
  (chatDb.models.Chat as SoftDeleteModel<TChat>) ||
  chatDb.model<TChat, SoftDeleteModel<TChat>>("Chat", chatSchema);

export default Chat;
