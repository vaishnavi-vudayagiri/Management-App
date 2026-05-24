import express from "express";
import { createCardFromEmail } from "../controllers/InboundController.js";

const router = express.Router();

// Public endpoint for inbound email processors (requires inboundToken in payload)
router.post("/", createCardFromEmail);

export default router;
