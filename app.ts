import cors from "cors";
import dotenv from "dotenv";
import express from "express";

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
  if (!origin) {
    return ["*"];
  }

  return origin
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};

const getPort = (): number => {
  const parsed = Number(process.env.PORT || 8000);
  if (!Number.isInteger(parsed) || parsed <= 0 || parsed > 65535) {
    return 8000;
  }

  return parsed;
};

const bootstrap = async () => {
  await connectDatabases();

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

  const userManagementRoutes = (
    await import("./modules/user-management/feature")
  ).default;
  const chatManagementRoutes = (
    await import("./modules/chat-management/feature")
  ).default;

  app.use(
    cors({
      origin: getCorsOrigins(),
      credentials: true,
    }),
  );
  app.use(express.json());

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

  const port = getPort();
  const server = app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });

  const shutdown = async (signal: string) => {
    console.log(`Received ${signal}. Starting graceful shutdown...`);

    // Close message worker
    if (messageWorker) {
      console.log("[MessageBus] Closing worker...");
      await messageWorker.close();
      console.log("[MessageBus] Worker closed");
    }

    // Close server
    await new Promise<void>((resolve, reject) => {
      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }
        resolve();
      });
    });

    // Disconnect databases
    await disconnectDatabases();

    // Disconnect Redis
    await disconnectRedis();

    process.exit(0);
  };

  process.on("SIGTERM", () => {
    void shutdown("SIGTERM");
  });

  process.on("SIGINT", () => {
    void shutdown("SIGINT");
  });
};

bootstrap().catch((error) => {
  console.error("Failed to start application:", error);
  process.exit(1);
});
