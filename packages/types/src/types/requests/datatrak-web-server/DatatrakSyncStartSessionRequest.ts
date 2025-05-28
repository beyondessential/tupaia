export type Params = {};

type QueuedSyncResBody = {
  status: 'queued' | 'syncing';
};
type SyncSessionStartedResBody = {
  sessionId: string;
  startedAtTick: number;
};

export type ResBody = QueuedSyncResBody | SyncSessionStartedResBody;

export type ReqBody = {
  lastSyncedTick: number;
};

export type ReqQuery = Record<string, never>;
