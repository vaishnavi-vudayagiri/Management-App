import express from "express";
import {
  getActivities,
} from "../controllers/ActivityController.js";

import { authMiddleware } from "../middlewares/AuthMiddleware.js";

const router = express.Router();

router.get("/:boardId", authMiddleware, getActivities);

export default router;