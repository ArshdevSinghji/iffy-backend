import { Queue } from "bullmq";
import { getRedis } from "../database/redis";

export const USER_EVENTS_QUEUE = "user-events";

export const userEventsQueue = new Queue(USER_EVENTS_QUEUE, {
  connection: getRedis(),
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: "exponential", delay: 1000 },
    removeOnComplete: true,
    removeOnFail: false, // keep failed jobs for inspection
  },
});