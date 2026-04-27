import mongoose, { Connection } from "mongoose";

let userDbConnection: Connection | undefined;
let chatDbConnection: Connection | undefined;

const getEnv = (keys: string[]): string | undefined => {
  for (const key of keys) {
    const value = process.env[key];
    if (value && value.trim()) {
      return value.trim();
    }
  }

  return undefined;
};

const getUserDbUri = (): string => {
  const userUri = getEnv(["MONGODB_USER_URI", "MONOGODB_USER_URI"]);
  if (userUri) {
    return userUri;
  }

  const fallback = getEnv(["MONGODB_URI", "MONOGODB_URI"]);
  if (fallback) {
    return fallback;
  }

  throw new Error(
    "Missing MongoDB user DB URI. Set MONGODB_USER_URI (or MONOGODB_USER_URI).",
  );
};

const getChatDbUri = (): string => {
  const chatUri = getEnv(["MONGODB_CHAT_URI", "MONOGODB_CHAT_URI"]);
  if (chatUri) {
    return chatUri;
  }

  const fallback = getEnv(["MONGODB_URI", "MONOGODB_URI"]);
  if (fallback) {
    return fallback;
  }

  throw new Error(
    "Missing MongoDB chat DB URI. Set MONGODB_CHAT_URI (or MONOGODB_CHAT_URI).",
  );
};

export const connectDatabases = async (): Promise<void> => {
  if (userDbConnection && chatDbConnection) {
    return;
  }

  userDbConnection = mongoose.createConnection(getUserDbUri());
  chatDbConnection = mongoose.createConnection(getChatDbUri());

  await Promise.all([
    userDbConnection.asPromise(),
    chatDbConnection.asPromise(),
  ]);

  console.log(
    `[DB] User database connected (${userDbConnection.name || "unknown"})`,
  );
  console.log(
    `[DB] Chat database connected (${chatDbConnection.name || "unknown"})`,
  );
};

export const disconnectDatabases = async (): Promise<void> => {
  const closes: Array<Promise<void>> = [];

  if (userDbConnection) {
    closes.push(userDbConnection.close());
  }

  if (chatDbConnection) {
    closes.push(chatDbConnection.close());
  }

  await Promise.all(closes);

  userDbConnection = undefined;
  chatDbConnection = undefined;
};

export { getRedis, disconnectRedis } from "./redis";

export const getUserDbConnection = (): Connection => {
  if (!userDbConnection) {
    throw new Error(
      "User database is not initialized. Call connectDatabases() before importing models.",
    );
  }

  return userDbConnection;
};

export const getChatDbConnection = (): Connection => {
  if (!chatDbConnection) {
    throw new Error(
      "Chat database is not initialized. Call connectDatabases() before importing models.",
    );
  }

  return chatDbConnection;
};
