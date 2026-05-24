import express from "express";

import {
  createBoard, getBoards, getSingleBoard, deleteBoard, getBoardMembers,

  removeBoardMember, inviteBoardMember,
  generateInboundToken,
  acceptBoardInvite, getMyBoardInvites, updateBoard,
  leaveBoard
} from "../controllers/BoardController.js";

import { authMiddleware } from "../middlewares/AuthMiddleware.js";


const router = express.Router();

//create custom board
router.post("/", authMiddleware, createBoard);

//get all boards
router.get("/", authMiddleware, getBoards);

//members get board members
router.get("/:id/members", authMiddleware, getBoardMembers);



router.post("/:id/invite", authMiddleware, inviteBoardMember);
router.post("/:id/inbound", authMiddleware, generateInboundToken);

router.post("/:id/accept", authMiddleware, acceptBoardInvite);

router.delete(
  "/:id/members/:userId",
  authMiddleware,
  removeBoardMember
);

router.get("/invites/me", authMiddleware, getMyBoardInvites);

router.put("/:id", authMiddleware, updateBoard);
router.post("/:id/leave", authMiddleware, leaveBoard);

//get signle board
router.get("/:id", authMiddleware, getSingleBoard);

//delete board

router.delete("/:id", authMiddleware, deleteBoard);

export default router;