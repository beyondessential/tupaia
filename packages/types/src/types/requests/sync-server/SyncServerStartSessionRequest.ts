export type Params = {};

export enum QueueStatus {
  WaitingInQueue = 'waitingInQueue',
  ActiveSync = 'activeSync',
}

export type ResBody = {
  sessionId?: string;
  status?: QueueStatus;
  behind?: {
    id: string;
    lastSyncedTick: number;
    urgent: boolean;
  };
};
export type ReqBody = {
  deviceId: string;
};
export type ReqQuery = Record<string, never>;
