const connectDB = require("./config/db");
const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Consumer } = require("./message-bus/consumer");
const { eventHandler } = require("./event-handler");
const { initSocket, getIO } = require("./sockets");
const { handleError } = require("./middleware/handle-error");

require("dotenv").config();

const PORT = process.env.PORT;

const app = express();
const server = http.createServer(app);
let consumer;
let isShuttingDown = false;

app.use(
  cors({
    origin: process.env.CORS_ORIGIN.split(","),
  }),
);

app.use(express.json());

app.use("/", require("./routes"));
app.use(handleError);

const closeHttpServer = () => {
  return new Promise((resolve, reject) => {
    server.close((error) => {
      if (error) {
        return reject(error);
      }
      return resolve();
    });
  });
};

const shutdown = async (signal) => {
  if (isShuttingDown) {
    return;
  }

  isShuttingDown = true;
  console.log(`Received ${signal}. Starting graceful shutdown...`);

  try {
    try {
      const io = getIO();
      await io.close();
      console.log("Socket.IO closed");
    } catch (_error) {
      console.log("Socket.IO was not initialized or already closed");
    }

    if (server.listening) {
      await closeHttpServer();
      console.log("HTTP server closed");
    }

    if (consumer) {
      await consumer.close();
      console.log("Message bus consumer closed");
    }

    await mongoose.disconnect();
    console.log("MongoDB disconnected");

    process.exit(0);
  } catch (error) {
    console.error("Error during graceful shutdown:", error);
    process.exit(1);
  }
};

const startServer = async () => {
  try {
    await connectDB();
    initSocket(server);

    server.listen(PORT, async () => {
      consumer = new Consumer(
        process.env.RABBIT_MQ_URL,
        process.env.RABBITMQ_TOPIC_EXCHANGE,
      );

      await consumer.consume("user.#", eventHandler);

      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error);
    process.exit(1);
  }
};

startServer();

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
process.on("uncaughtException", async (error) => {
  console.error("Uncaught exception:", error);
  await shutdown("uncaughtException");
});
process.on("unhandledRejection", async (reason) => {
  console.error("Unhandled rejection:", reason);
  await shutdown("unhandledRejection");
});
