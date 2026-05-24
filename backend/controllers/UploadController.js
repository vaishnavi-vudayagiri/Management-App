import CardModel from "../models/cardModel.js";
import { createActivity } from "./ActivityController.js";
import { getIO } from "../sockets/socket.js";


// UPLOAD ATTACHMENT
export const uploadAttachment = async (req, res, next) => {
  try {
    console.log("Upload Attachment API called");

    const { cardId } = req.params;

    const card = await CardModel.findById(cardId);

    if (!card) {
      return res.status(404).json({
        message: "Card not found",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        message: "No file uploaded",
      });
    }

    // multer file path
    const filePath = req.file.path;

    // save attachment
    card.attachments.push(filePath);

    await card.save();

    console.log("Attachment uploaded:", filePath);

    // activity
    await createActivity({
      boardId: card.boardId,
      listId: card.listId,
      cardId: card._id,
      userId: req.user.id,
      action: "uploaded attachment",
      details: `Uploaded ${req.file.originalname}`,
    });

    // socket emit
    const io = getIO();

    io.to(card.boardId.toString()).emit(
      "attachment-uploaded",
      {
        cardId: card._id,
        file: filePath,
        card,
      }
    );

    console.log("Socket emitted: attachment-uploaded");

    res.json({
      message: "File uploaded successfully",
      file: filePath,
      card,
    });

  } catch (err) {
    next(err);
  }
};



// DELETE ATTACHMENT
export const deleteAttachment = async (req, res, next) => {
  try {
    console.log("Delete Attachment API called");

    const { cardId } = req.params;
    const { file } = req.body;

    const card = await CardModel.findById(cardId);

    if (!card) {
      return res.status(404).json({
        message: "Card not found",
      });
    }

    // remove file
    card.attachments = card.attachments.filter(
      (item) => item !== file
    );

    await card.save();

    console.log("Attachment removed:", file);

    // activity
    await createActivity({
      boardId: card.boardId,
      listId: card.listId,
      cardId: card._id,
      userId: req.user.id,
      action: "deleted attachment",
      details: "Deleted attachment",
    });

    // socket emit
    const io = getIO();

    io.to(card.boardId.toString()).emit(
      "attachment-deleted",
      {
        cardId: card._id,
        file,
        card,
      }
    );

    console.log("Socket emitted: attachment-deleted");

    res.json({
      message: "Attachment removed successfully",
      card,
    });

  } catch (err) {
    next(err);
  }
};