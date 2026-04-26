import { Server as HttpServer } from "http";
import jwt from "jsonwebtoken";
import { Server, Socket } from "socket.io";
import { chatHandler } from "../socket/chat.handler";

// ─── Types ────────────────────────────────────────────────────────────────────

export type AuthedSocket = Socket & { userId: string };

// ─── Singleton ────────────────────────────────────────────────────────────────

let io: Server | null = null;

export const getIO = (): Server => {
  if (!io) throw new Error("Socket.io not initialized");
  return io;
};

// ─── Init ─────────────────────────────────────────────────────────────────────

export const initSocket = (server: HttpServer): void => {
  io = new Server(server, {
    cors: {
      origin: process.env.CORS_ORIGIN?.split(",") ?? [],
      methods: ["GET", "POST", "PUT", "DELETE"],
      credentials: true,
    },
    allowEIO3: true,
    transports: ["polling"],
  });

  io.use(authMiddleware);

  io.on("connection", (socket) => {
    const authedSocket = socket as AuthedSocket;
    authedSocket.join(authedSocket.userId);
    chatHandler(io as Server, authedSocket);
  });
};

// ─── Auth Middleware ──────────────────────────────────────────────────────────

const authMiddleware = (socket: Socket, next: (err?: Error) => void): void => {
  const token = socket.handshake.auth.token as string | undefined;

  if (!token) {
    return next(new Error("Authentication error: no token provided"));
  }

  jwt.verify(token, process.env.JWT_SECRET ?? "", (err, decoded) => {
    if (err || !decoded) {
      return next(new Error("Authentication error: invalid token"));
    }

    (socket as AuthedSocket).userId = String((decoded as { sub?: string }).sub);
    next();
  });
};
