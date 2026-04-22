import mongoose, { HydratedDocument, InferSchemaType, Schema } from "mongoose";

import { encryptChatText } from "../../../utils/chat-crypto";

const roomSchema = new Schema(
  {
    _id: { type: Schema.Types.ObjectId },
    participants: {
      one: {
        _id: { type: Schema.Types.ObjectId },
        name: { type: String },
        persona: { type: String },
      },
      two: {
        _id: { type: Schema.Types.ObjectId },
        name: { type: String },
        persona: { type: String },
      },
    },
    last_message: {
      text: { type: String },
      sender_id: { type: Schema.Types.ObjectId },
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

export type TRoom = InferSchemaType<typeof roomSchema>;
type RoomMethods = {
  updateLastMessage: (
    text: string,
    senderId: mongoose.Types.ObjectId | string,
  ) => Promise<unknown>;
  incrementUnreadMessages: (
    userId: mongoose.Types.ObjectId | string,
  ) => Promise<unknown>;
  decrementUnreadMessages: (
    userId: mongoose.Types.ObjectId | string,
  ) => Promise<unknown>;
  resetUnreadMessages: (
    userId: mongoose.Types.ObjectId | string,
  ) => Promise<unknown>;
  updateParticipantPersona: (
    userId: mongoose.Types.ObjectId | string,
    persona: string,
  ) => Promise<unknown>;
  deleteRoom: () => Promise<unknown>;
};

export type RoomDocument = HydratedDocument<TRoom> & RoomMethods;

roomSchema.methods.updateLastMessage = function (
  this: RoomDocument,
  text: string,
  senderId: mongoose.Types.ObjectId | string,
) {
  this.last_message = {
    text: encryptChatText(text),
    sender_id: senderId,
    timestamp: new Date(),
  };

  return this.save();
};

roomSchema.methods.incrementUnreadMessages = function (
  this: RoomDocument,
  userId: mongoose.Types.ObjectId | string,
) {
  const key = String(userId);
  const currentCount = this.unread_messages.get(key) || 0;

  this.unread_messages.set(key, currentCount + 1);
  return this.save();
};

roomSchema.methods.decrementUnreadMessages = function (
  this: RoomDocument,
  userId: mongoose.Types.ObjectId | string,
) {
  const key = String(userId);
  const currentCount = this.unread_messages.get(key) || 0;
  const newCount = Math.max(currentCount - 1, 0);

  this.unread_messages.set(key, newCount);
  return this.save();
};

roomSchema.methods.resetUnreadMessages = function (
  this: RoomDocument,
  userId: mongoose.Types.ObjectId | string,
) {
  this.unread_messages.set(String(userId), 0);
  return this.save();
};

roomSchema.methods.updateParticipantPersona = function (
  this: RoomDocument,
  userId: mongoose.Types.ObjectId | string,
  persona: string,
) {
  if (String(this.participants.one._id) === String(userId)) {
    this.participants.one.persona = persona;
  } else if (String(this.participants.two._id) === String(userId)) {
    this.participants.two.persona = persona;
  }

  return this.save();
};

roomSchema.methods.deleteRoom = function (this: RoomDocument) {
  this.is_deleted = true;
  return this.save();
};

const Room = mongoose.model<TRoom>("Room", roomSchema);

export default Room;
