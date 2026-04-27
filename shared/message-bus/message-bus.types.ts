export type EventKey =
  | "user.profile.update"
  | "user.profile.deleted"
  | "user.match.created";

export interface EventPayloadMap {
  "user.profile.update": {
    _id: string;
    name: string;
    persona: string;
  };
  "user.profile.deleted": {
    _id: string;
  };
  "user.match.created": {
    _id: string;
    participants: {
      one: { _id: string; name: string; persona?: string };
      two: { _id: string; name: string; persona?: string };
    };
  };
}

export interface EventJob<K extends EventKey = EventKey> {
  key: K;
  data: EventPayloadMap[K];
}
