import "dotenv/config";
import express from "express";
import { connect } from "mongoose";
import cookieParser from "cookie-parser";
import http from "http";
import cors from "cors";

import AuthRoutes from "./routes/AuthRoutes.js";
import ListRoutes from "./routes/ListRoutes.js";
import CardRoutes from "./routes/CardRoutes.js";
import BoardRoutes from "./routes/BoardRoutes.js";
import ActivityRoutes from "./routes/ActivityRoutes.js";
import UploadRoutes from "./routes/UploadRoutes.js";
import InboundRoutes from "./routes/InboundRoutes.js";

import { errorMiddleware } from "./middlewares/errorMiddleware.js";
import { initSocket } from "./sockets/socket.js";
import startImapListener from "./services/imapListener.js";

const app = express();

const port = process.env.PORT || 5000;

const corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
};
app.use(cors(corsOptions));


// middlewares
app.use(express.json());
app.use(cookieParser());


// static folder
app.use("/uploads", express.static("uploads"));


// routes
app.use("/api/auth", AuthRoutes);
app.use("/api/boards", BoardRoutes);
app.use("/api/lists", ListRoutes);
app.use("/api/cards", CardRoutes);
app.use("/api/activity", ActivityRoutes);
app.use("/api/upload", UploadRoutes);
app.use("/api/inbound", InboundRoutes);


// error middleware (must be after routes)
app.use(errorMiddleware);


// DB connection + server start
const connectDB = async () => {
  try {
    await connect(process.env.DB_URL);

    console.log("DB Connected");


    // create http server
    const server = http.createServer(app);


    // initialize socket
    initSocket(server);

    // start IMAP listener (if configured)
    startImapListener().catch((err) => console.error('IMAP listener failed to start', err));


    // listen
    server.listen(port, () => {
      console.log(
        `Server running on http://localhost:${port}`
      );
    });

  } catch (err) {
    console.log(err);
  }
};

connectDB();