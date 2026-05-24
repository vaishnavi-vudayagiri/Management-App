import express from "express";

import {
  createList,
  getBoardLists,
  updateList,
  deleteList,
  reorderLists,
} from "../controllers/ListController.js";

import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();


// create custom list
router.post("/", authMiddleware, createList);


// get all lists in board
router.get("/:boardId", authMiddleware, getBoardLists);


// update list title
router.put("/:id", authMiddleware, updateList);


// delete list
router.delete("/:id", authMiddleware, deleteList);


// reorder lists
router.put("/reorder/all", authMiddleware, reorderLists);


export default router;