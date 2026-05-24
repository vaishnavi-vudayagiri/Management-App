import { Schema, model } from "mongoose";

const ActivitySchema = new Schema(
  {
    // which board this activity belongs to
    boardId: {
      type: Schema.Types.ObjectId,
      ref: "BoardModel",
      required: true,
    },

    // optional list reference
    listId: {
      type: Schema.Types.ObjectId,
      ref: "ListModel",
    },

    // optional card reference
    cardId: {
      type: Schema.Types.ObjectId,
      ref: "CardModel",
    },

    // who did action
    userId: {
      type: Schema.Types.ObjectId,
      ref: "UserModel",
      required: true,
    },

    // action text
    action: {
      type: String,
      required: true,
    },

    // optional metadata
    details: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

export default model("ActivityModel", ActivitySchema);