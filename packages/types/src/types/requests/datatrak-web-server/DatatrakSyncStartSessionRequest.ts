export type Params = {};

type SyncSessionStartedResBody = {
  sessionId: string;
  startedAtTick: number;
};

export type ResBody = SyncSessionStartedResBody;

export type ReqBody = {};

export type ReqQuery = Record<string, never>;
