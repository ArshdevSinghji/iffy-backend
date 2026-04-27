import { createUserEventsWorker } from "./message-bus.worker";

let initialized = false;

export const initMessageBus = (): void => {
  if (initialized) return;

  createUserEventsWorker();
  initialized = true;

  console.log("[MessageBus] Chat worker listening on user-events queue");
};
