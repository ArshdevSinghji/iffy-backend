import { userEventsQueue } from "../../../../shared/message-bus";
import type { EventKey, EventPayloadMap } from "../../../../shared/message-bus";

export const publishEvent = async <K extends EventKey>(
  key: K,
  data: EventPayloadMap[K],
): Promise<void> => {
  await userEventsQueue.add(key, { key, data });
};
