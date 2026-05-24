import mongoose from "mongoose";

const { Schema } = mongoose;

const cardSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "title required"],
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },

    listId: {
  type: Schema.Types.ObjectId,
  ref: "ListModel",
  default: null,
},

    boardId: {
      type: Schema.Types.ObjectId,
      ref: "BoardModel",
      required: true,
    },

    order: {
      type: Number,
      default: 0,
    },

    assignedTo: [
      {
        type: Schema.Types.ObjectId,
        ref: "UserModel",
      },
    ],

    status: {
      type: String,
      enum: ["done", "ongoing", "pending"],
      default: "ongoing",
    },

    attachments: [
      {
        type: String,
      },
    ],
  },
  { timestamps: true }
);

const CardModel =
  mongoose.models.Card ||
  mongoose.model("Card", cardSchema);

export default CardModel;