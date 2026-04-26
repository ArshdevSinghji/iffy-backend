// ─── event/index.ts ───────────────────────────────────────────────────────────

import { handleUserProfileUpdate } from "./user-profile-update/user-profile-update.event";
import { handleUserProfileDeleted } from "./user-profile-deleted/user-profile-deleted.event";
import { handleUserMatchCreated } from "./user-match-created/user-match-created.event";

// ─── Types ────────────────────────────────────────────────────────────────────

type EventKey =
  | "user.profile.update"
  | "user.profile.deleted"
  | "user.match.created";

type EventHandler = (data: unknown) => Promise<void>;

// ─── Registry ─────────────────────────────────────────────────────────────────
// Add new events here — no switch statements, no if/else chains

const eventRegistry: Record<EventKey, EventHandler> = {
  "user.profile.update": handleUserProfileUpdate,
  "user.profile.deleted": handleUserProfileDeleted,
  "user.match.created": handleUserMatchCreated,
};

// ─── Dispatcher ───────────────────────────────────────────────────────────────

export const eventHandler = (data: unknown, key: string): void => {
  const handler = eventRegistry[key as EventKey];

  if (!handler) {
    console.warn(`[EventHandler] Unhandled event key: "${key}"`);
    return;
  }

  handler(data).catch((error) => {
    console.error(`[EventHandler] Error processing event "${key}":`, error);
  });
};
