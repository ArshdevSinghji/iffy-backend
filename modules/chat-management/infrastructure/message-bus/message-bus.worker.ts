import { Worker, Job } from "bullmq";
import { USER_EVENTS_QUEUE } from "../../../../shared/message-bus";
import type { EventJob } from "../../../../shared/message-bus";
import { eventHandler } from "../../events";
import { getRedis } from "../../../../shared/database/redis";

export const createUserEventsWorker = (): Worker => {
  const worker = new Worker(
    USER_EVENTS_QUEUE,
    async (job: Job<EventJob>) => {
      const { key, data } = job.data;
      await eventHandler(data, key);
    },
    {
      connection: getRedis(),
      concurrency: 5,
    },
  );

  worker.on("completed", (job) => {
    console.log(`[MessageBus] Job completed: ${job.data.key}`);
  });

  worker.on("failed", (job, error) => {
    console.error(`[MessageBus] Job failed: ${job?.data.key}`, error);
  });

  return worker;
};
