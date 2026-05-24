import CardModel from "../models/cardModel.js";
import BoardModel from "../models/boardModel.js";
import { createActivity } from "./ActivityController.js";
import { getIO } from "../sockets/socket.js";

// Create card from inbound email
export const createCardFromEmail = async (req, res, next) => {
    try {
        // Expect inboundToken in body (generated per-board) and email payload
        const { inboundToken, subject, text, html, from, attachments } = req.body;

        if (!inboundToken) {
            return res.status(400).json({ message: "inboundToken required" });
        }

        const board = await BoardModel.findOne({ inboundToken });
        if (!board) {
            return res.status(404).json({ message: "Board not found for token" });
        }

        const title = subject || "(no subject)";
        const description = text || html || "";

        const card = await CardModel.create({
            title,
            description,
            boardId: board._id,
            listId: null,
            status: "ongoing",
        });

        // save attachments (array of URLs) if provided
        if (attachments && Array.isArray(attachments) && attachments.length) {
            card.attachments = attachments;
            await card.save();
        }

        // activity
        await createActivity({
            boardId: board._id,
            listId: null,
            cardId: card._id,
            userId: board.owner,
            action: "created via email",
            details: `From ${from || "unknown"}`,
        });

        // socket emit
        const io = getIO();
        io.to(board._id.toString()).emit("card-created", { card });

        res.status(201).json({ message: "Card created from email", card });
    } catch (err) {
        next(err);
    }
};

export default { createCardFromEmail };
