export enum SyncReadyStatus {
  READY = 'ready',
  PENDING = 'pending',
}
export type Params = {
  sessionId: string;
};

export type ResBody = {
  status: SyncReadyStatus;
};
export type ReqBody = Record<string, never>;
export type ReqQuery = Record<string, never>;
