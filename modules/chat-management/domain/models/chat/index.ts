import { HydratedDocument, Schema, InferSchemaType, Model } from "mongoose";
import mongooseDelete, { SoftDeleteModel } from "mongoose-delete";

import { getChatDbConnection } from "../../../../../shared/database";
import { encryptChatText } from "../../../utils/chat-crypto";

interface ChatMethods {
  delete(): Promise<unknown>;
  deleteMessage(): Promise<unknown>;
  updateMessage(updatedText: string): Promise<unknown>;
}

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

export type ChatDocument = HydratedDocument<TChat, ChatMethods>;

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

chatSchema.plugin(mongooseDelete, { deletedAt: true, overrideMethods: "all" });

type ChatModel = SoftDeleteModel<TChat, Model<TChat>, ChatMethods>;

const chatDb = getChatDbConnection();

const Chat: ChatModel =
  (chatDb.models.Chat as ChatModel) ??
  chatDb.model<TChat, ChatModel>("Chat", chatSchema);

export default Chat;
