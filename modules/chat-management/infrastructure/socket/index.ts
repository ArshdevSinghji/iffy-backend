import { Server as HttpServer } from "http";
import jwt from "jsonwebtoken";
import { Server, Socket } from "socket.io";

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
    transports: ["websocket", "polling"],
  });

  io.use(authMiddleware);

  io.on("connection", async (socket) => {
    const authedSocket = socket as AuthedSocket;

    authedSocket.join(authedSocket.userId);
    // Lazy-load chatHandler to avoid loading models before DB connection
    const { chatHandler } = await import("./chat.handler");
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

    const decodedToken = decoded as { id?: string; sub?: string };
    (socket as AuthedSocket).userId = String(
      decodedToken.id || decodedToken.sub,
    );
    next();
  });
};
