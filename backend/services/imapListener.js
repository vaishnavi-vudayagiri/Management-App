import Imap from "imap";
import { simpleParser } from "mailparser";
import fs from "fs";
import path from "path";

import BoardModel from "../models/boardModel.js";
import CardModel from "../models/cardModel.js";
import { createActivity } from "../controllers/ActivityController.js";
import { getIO } from "../sockets/socket.js";

const UPLOAD_DIR = path.join(process.cwd(), "uploads", "inbound");

const ensureUploadDir = async () => {
  await fs.promises.mkdir(UPLOAD_DIR, { recursive: true });
};

const extractTokenFromAddresses = (addresses) => {
  if (!addresses || !addresses.value) return null;

  for (const addr of addresses.value) {
    if (!addr.address) continue;

    const local = addr.address.split("@")[0];

    if (local.includes("+")) {
      const parts = local.split("+");
      if (parts[1]) return parts[1];
    }
  }

  return null;
};

const extractTokenFromSubject = (subject) => {
  if (!subject) return null;

  const match = subject.match(/inboundToken[:=]\s*([a-zA-Z0-9]+)/i);

  if (match) return match[1];

  return null;
};

const startImapListener = async () => {
  if (
    !process.env.INBOUND_GMAIL_EMAIL ||
    !process.env.INBOUND_GMAIL_APP_PASSWORD
  ) {
    console.log(
      "IMAP listener not started: missing INBOUND_GMAIL_EMAIL or INBOUND_GMAIL_APP_PASSWORD in .env"
    );
    return;
  }

  await ensureUploadDir();

  const imap = new Imap({
    user: process.env.INBOUND_GMAIL_EMAIL,
    password: process.env.INBOUND_GMAIL_APP_PASSWORD,
    host: process.env.INBOUND_GMAIL_HOST || "imap.gmail.com",
    port: parseInt(process.env.INBOUND_GMAIL_PORT || "993", 10),
    tls: true,
    tlsOptions: {
      rejectUnauthorized: false,
    },
  });

  const openInbox = (cb) => {
    imap.openBox("INBOX", false, cb);
  };

  const processUnreadEmails = () => {
    imap.search(["UNSEEN"], (err, results) => {
      if (err) {
        console.error("IMAP search error", err);
        return;
      }

      if (!results || !results.length) {
        return;
      }

      const fetch = imap.fetch(results, {
        bodies: "",
        markSeen: true,
      });

      fetch.on("message", (msg) => {
        msg.on("body", async (stream) => {
          try {
            const parsed = await simpleParser(stream);

            console.log("EMAIL RECEIVED");
            console.log("TO:", parsed.to?.text);
            console.log("SUBJECT:", parsed.subject);

            const token =
              extractTokenFromAddresses(parsed.to) ||
              extractTokenFromSubject(parsed.subject);

            if (!token) {
              console.log("No inbound token found in message; skipping");
              return;
            }

            const board = await BoardModel.findOne({
              inboundToken: token,
            });

            if (!board) {
              console.log("No board found for token:", token);
              return;
            }

            const rawSubject = parsed.subject || "(no subject)";

const cleanTitle = rawSubject
  .replace(/inboundToken[:=]\s*[a-zA-Z0-9]+/i, "")
  .trim() || "(no subject)";

         const card = await CardModel.create({
  title: cleanTitle,
  description: parsed.text || parsed.html || "",
  boardId: board._id,
  listId: null,
  status: "ongoing",
  order: Date.now(),
  attachments: [],
});

            if (parsed.attachments?.length) {
              const urls = [];

              for (const attachment of parsed.attachments) {
                const safeName =
                  attachment.filename || `attachment-${Date.now()}`;

                const fileName = `${Date.now()}-${safeName}`;

                const filePath = path.join(UPLOAD_DIR, fileName);

                await fs.promises.writeFile(
                  filePath,
                  attachment.content
                );

                urls.push(`/uploads/inbound/${fileName}`);
              }

              card.attachments = urls;
              await card.save();
            }

            await createActivity({
              boardId: board._id,
              listId: null,
              cardId: card._id,
              userId: board.owner,
              action: "created via email",
              details: `Email from ${
  parsed.from?.text || "unknown"
} created card "${cleanTitle}"`,
            });

            const io = getIO();

            if (io) {
              io.to(board._id.toString()).emit("card-created", card);
              io.to(board._id.toString()).emit("activity-added");
            }

            console.log(
              "Created card from email for board",
              board._id.toString()
            );
          } catch (error) {
            console.error("Error parsing/fetching email", error);
          }
        });
      });

      fetch.once("error", (err) => {
        console.error("Fetch error", err);
      });
    });
  };

  imap.once("ready", () => {
    openInbox((err) => {
      if (err) {
        console.error("IMAP open error", err);
        return;
      }

      console.log("IMAP connected, monitoring INBOX for new messages");

      imap.on("mail", () => {
        processUnreadEmails();
      });
    });
  });

  imap.once("error", (err) => {
    console.error("IMAP error", err);

    setTimeout(() => {
      console.log("Reconnecting IMAP...");
      startImapListener();
    }, 5000);
  });

  imap.once("end", () => {
    console.log("IMAP connection ended");

    setTimeout(() => {
      console.log("Reconnecting IMAP...");
      startImapListener();
    }, 5000);
  });

  imap.connect();
};

export default startImapListener;