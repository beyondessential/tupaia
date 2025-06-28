export enum SyncPullReadyStatus {
  READY = 'ready',
  PENDING = 'pending',
}
export type Params = {
  sessionId: string;
};
export type ResBody = {
  status: SyncPullReadyStatus;
};
export type ReqBody = Record<string, never>;
export type ReqQuery = Record<string, never>;
