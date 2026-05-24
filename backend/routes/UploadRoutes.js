import express from "express";
import upload from "../middlewares/uploadMiddleware.js";
import {
  uploadAttachment,
  deleteAttachment,
} from "../controllers/UploadController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();


// upload file
router.post(
  "/:cardId",
  authMiddleware,
  upload.single("file"),
  uploadAttachment
);


// delete file
router.delete(
  "/:cardId",
  authMiddleware,
  deleteAttachment
);

export default router;