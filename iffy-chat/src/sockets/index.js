const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const chatHandler = require("./chat-handler");

let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CORS_ORIGIN.split(","),
      methods: ["GET", "POST", "PUT", "DELETE"],
      credentials: true,
    },
    allowEIO3: true,
    transports: ["polling"],
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error("Authentication error"));
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return next(new Error("Authentication error"));
      }
      socket.userId = decoded.sub;
      next();
    });
  });

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.userId}`);
    socket.join(socket.userId.toString());
    chatHandler(io, socket);
    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.userId}`);
    });
  });
};

const getIO = () => {
  if (!io) throw new Error("Socket.io not initialized!");
  return io;
};

module.exports = { initSocket, getIO };
