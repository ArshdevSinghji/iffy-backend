import { createServer, Server as HttpServer } from "http";
import jwt from "jsonwebtoken";
import { Server } from "socket.io";

import chatHandler from "./chat-handler";

let io: Server | undefined;

const initSocket = (server: HttpServer) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CORS_ORIGIN?.split(",") || [],
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

    jwt.verify(token, process.env.JWT_SECRET || "", (err, decoded) => {
      if (err) {
        return next(new Error("Authentication error"));
      }

      (socket as typeof socket & { userId: string }).userId = String(
        (decoded as { sub?: string }).sub,
      );
      next();
    });
  });

  io.on("connection", (socket) => {
    const authedSocket = socket as typeof socket & { userId: string };
    authedSocket.join(authedSocket.userId.toString());
    chatHandler(io as Server, authedSocket);
  });
};

const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }

  return io;
};

export { getIO, initSocket };
