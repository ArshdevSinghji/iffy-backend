import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { createServer } from "http";

import {
  connectDatabases,
  disconnectDatabases,
  disconnectRedis,
} from "./shared/database";
import { globalErrorHandler } from "./shared/middleware";
import type { Worker } from "bullmq";

dotenv.config();

const app = express();
let messageWorker: Worker | null = null;

const getCorsOrigins = (): string[] => {
  const origin = process.env.CORS_ORIGIN;
  if (!origin) return ["*"];
  return origin
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};

const getPort = (): number => {
  const parsed = Number(process.env.PORT || 8000);
  if (!Number.isInteger(parsed) || parsed <= 0 || parsed > 65535) return 8000;
  return parsed;
};

const bootstrap = async () => {
  await connectDatabases();

  // ─── HTTP Server ────────────────────────────────────────────────────────────
  const httpServer = createServer(app);

  // ─── Socket.io ──────────────────────────────────────────────────────────────
  const { initSocket } =
    await import("./modules/chat-management/infrastructure/socket");
  initSocket(httpServer);

  // ─── Message Bus Worker ─────────────────────────────────────────────────────
  (async () => {
    try {
      const { createUserEventsWorker } =
        await import("./modules/chat-management/infrastructure/message-bus/message-bus.worker");
      messageWorker = createUserEventsWorker();
      console.log("[MessageBus] Worker initialized");
    } catch (error) {
      console.error("[MessageBus] Failed to initialize worker:", error);
    }
  })();

  // ─── Middleware ──────────────────────────────────────────────────────────────
  const corsOrigins = getCorsOrigins();
  app.use(cors({ origin: corsOrigins, credentials: true }));
  app.use(express.json());

  // ─── Routes ──────────────────────────────────────────────────────────────────
  const userManagementRoutes = (
    await import("./modules/user-management/feature")
  ).default;
  const chatManagementRoutes = (
    await import("./modules/chat-management/feature")
  ).default;

  app.use("/", userManagementRoutes);
  app.use("/", chatManagementRoutes);

  app.get("/health", (_req, res) => {
    res.status(200).json({
      status: "ok",
      message: "Server is running",
      timestamp: new Date().toISOString(),
    });
  });

  app.use(globalErrorHandler);

  // ─── Start ───────────────────────────────────────────────────────────────────
  const port = getPort();
  httpServer.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });

  // ─── Graceful Shutdown ───────────────────────────────────────────────────────
  const shutdown = async (signal: string) => {
    console.log(`Received ${signal}. Starting graceful shutdown...`);

    try {
      const { getIO } =
        await import("./modules/chat-management/infrastructure/socket");
      await getIO().close();
      console.log("[Socket.io] Closed");
    } catch {
      console.log("[Socket.io] Was not initialized or already closed");
    }

    if (messageWorker) {
      await messageWorker.close();
      console.log("[MessageBus] Worker closed");
    }

    await new Promise<void>((resolve, reject) => {
      httpServer.close((error) => {
        if (error) return reject(error);
        resolve();
      });
    });

    await disconnectDatabases();
    await disconnectRedis();

    process.exit(0);
  };

  process.on("SIGTERM", () => void shutdown("SIGTERM"));
  process.on("SIGINT", () => void shutdown("SIGINT"));
};

bootstrap().catch((error) => {
  console.error("Failed to start application:", error);
  process.exit(1);
});
