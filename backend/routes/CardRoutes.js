import express from "express";

import {
  createCard,
  getBoardCards,
  getListCards,
  updateCard,
  deleteCard,
  moveCard,
  reorderCards,
} from "../controllers/CardController.js";

import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();


// create card
router.post("/", authMiddleware, createCard);


// get all cards in board
router.get("/board/:boardId", authMiddleware, getBoardCards);


// get cards in list
router.get("/list/:listId", authMiddleware, getListCards);


// update card
router.put("/:id", authMiddleware, updateCard);


// delete card
router.delete("/:id", authMiddleware, deleteCard);


// move card between lists
router.put("/move/:id", authMiddleware, moveCard);


// reorder cards
router.put("/reorder/all", authMiddleware, reorderCards);


export default router;