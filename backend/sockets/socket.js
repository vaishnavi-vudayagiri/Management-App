import { Server } from "socket.io";

let io;


// initialize socket server
export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);


    // join board room
    socket.on("join-board", (boardId) => {
      socket.join(boardId);

      console.log(
        `Socket ${socket.id} joined board ${boardId}`
      );
    });


    // leave room
    socket.on("leave-board", (boardId) => {
      socket.leave(boardId);

      console.log(
        `Socket ${socket.id} left board ${boardId}`
      );
    });


    // disconnect
    socket.on("disconnect", () => {
      console.log(
        "User disconnected:",
        socket.id
      );
    });
  });

  return io;
};


// getter
export const getIO = () => {
  if (!io) {
    throw new Error("Socket not initialized");
  }

  return io;
};