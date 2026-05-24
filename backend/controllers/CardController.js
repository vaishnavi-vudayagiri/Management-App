import CardModel from "../models/cardModel.js";
import ListModel from "../models/listModel.js";

import { createActivity } from "./ActivityController.js";
import { getIO } from "../sockets/socket.js";


// CREATE CARD
export const createCard = async (req, res, next) => {
  try {
    console.log("Create Card API called");

    const {
      title,
      description,
      listId,
      boardId,
      assignedTo,
      status,
    } = req.body;

    // validation
    if (!title || !boardId) {
      return res.status(400).json({
        message: "Title, listId and boardId required",
      });
    }

   // check list only if listId exists
if (listId) {
  const list = await ListModel.findById(listId);

  if (!list) {
    return res.status(404).json({
      message: "List not found",
    });
  }
}

    // create card
    const card = await CardModel.create({
      title,
      description,
      listId,
      boardId,
      assignedTo,
      status,
      order: Date.now(),
    });

    console.log("Card created:", card._id);

    // activity
    await createActivity({
      boardId,
      listId,
      cardId: card._id,
      userId: req.user.id,
      action: "created card",
      details: `Created card ${title}`,
    });

    // populate
    const populatedCard = await CardModel.findById(card._id)
      .populate("assignedTo", "name email");

    // socket emit
    const io = getIO();

    io.to(boardId.toString()).emit(
      "card-created",
      populatedCard
    );

    console.log("Socket emitted: card-created");

    res.status(201).json({
      message: "Card created successfully",
      card: populatedCard,
    });

  } catch (err) {
    next(err);
  }
};



// GET ALL BOARD CARDS
export const getBoardCards = async (req, res, next) => {
  try {
    console.log("Get Board Cards API called");

    const { boardId } = req.params;

    const cards = await CardModel.find({
      boardId,
    })
      .populate("assignedTo", "name email")
      .sort({ order: 1 });

    res.json(cards);

  } catch (err) {
    next(err);
  }
};



// GET LIST CARDS
export const getListCards = async (req, res, next) => {
  try {
    console.log("Get List Cards API called");

    const { listId } = req.params;

    const cards = await CardModel.find({
      listId,
    })
      .populate("assignedTo", "name email")
      .sort({ order: 1 });

    res.json(cards);

  } catch (err) {
    next(err);
  }
};



// UPDATE CARD
export const updateCard = async (req, res, next) => {
  try {
    console.log("Update Card API called");

    const { id } = req.params;

    const updatedCard = await CardModel.findByIdAndUpdate(
      id,
      req.body,
      {
        returnDocument: "after",
      }
    ).populate("assignedTo", "name email");

    if (!updatedCard) {
      return res.status(404).json({
        message: "Card not found",
      });
    }

    // activity
    await createActivity({
      boardId: updatedCard.boardId,
      listId: updatedCard.listId,
      cardId: updatedCard._id,
      userId: req.user.id,
      action: "updated card",
      details: `Updated card ${updatedCard.title}`,
    });

    // socket emit
    const io = getIO();

    io.to(updatedCard.boardId.toString()).emit(
      "card-updated",
      updatedCard
    );

    console.log("Socket emitted: card-updated");

    res.json({
      message: "Card updated successfully",
      card: updatedCard,
    });

  } catch (err) {
    next(err);
  }
};



// DELETE CARD
export const deleteCard = async (req, res, next) => {
  try {
    console.log("Delete Card API called");

    const { id } = req.params;

    const card = await CardModel.findById(id);

    if (!card) {
      return res.status(404).json({
        message: "Card not found",
      });
    }

    // activity
    await createActivity({
      boardId: card.boardId,
      listId: card.listId,
      cardId: card._id,
      userId: req.user.id,
      action: "deleted card",
      details: `Deleted card ${card.title}`,
    });

    await CardModel.findByIdAndDelete(id);

    // socket emit
    const io = getIO();

    io.to(card.boardId.toString()).emit(
      "card-deleted",
      id
    );

    console.log("Socket emitted: card-deleted");

    res.json({
      message: "Card deleted successfully",
    });

  } catch (err) {
    next(err);
  }
};



// MOVE CARD
export const moveCard = async (req, res, next) => {
  try {
    console.log("Move Card API called");

    const { id } = req.params;
    const { newListId, newOrder } = req.body;

    const card = await CardModel.findById(id);

    if (!card) {
      return res.status(404).json({
        message: "Card not found",
      });
    }

    // move
    card.listId = newListId;
    card.order = newOrder;

    await card.save();

    // activity
    await createActivity({
      boardId: card.boardId,
      listId: newListId,
      cardId: card._id,
      userId: req.user.id,
      action: "moved card",
      details: `Moved card ${card.title}`,
    });

    // populate
    const populatedCard = await CardModel.findById(card._id)
      .populate("assignedTo", "name email");

    // socket emit
    const io = getIO();

    io.to(card.boardId.toString()).emit(
      "card-moved",
      populatedCard
    );

    console.log("Socket emitted: card-moved");

    res.json({
      message: "Card moved successfully",
      card: populatedCard,
    });

  } catch (err) {
    next(err);
  }
};



// REORDER CARDS
export const reorderCards = async (req, res, next) => {
  try {
    console.log("Reorder Cards API called");

    const { cards } = req.body;

    for (const item of cards) {
      await CardModel.findByIdAndUpdate(
        item.id,
        {
          order: item.order,
        }
      );
    }

    // socket emit
    const io = getIO();

    io.emit("cards-reordered", cards);

    console.log("Socket emitted: cards-reordered");

    res.json({
      message: "Cards reordered successfully",
    });

  } catch (err) {
    next(err);
  }
};