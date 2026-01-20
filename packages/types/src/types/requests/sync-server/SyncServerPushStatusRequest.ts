export enum SyncPushStatus {
  COMPLETE = 'complete',
  PENDING = 'pending',
}
export type Params = {
  sessionId: string;
};
export type ResBody = {
  status: SyncPushStatus;
};
export type ReqBody = Record<string, never>;
export type ReqQuery = Record<string, never>;
