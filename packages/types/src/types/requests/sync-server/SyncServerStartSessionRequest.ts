export type Params = {};

export enum QueueStatus {
  WaitingInQueue = 'waitingInQueue',
  ActiveSync = 'activeSync',
}

export type ResBody = {
  sessionId?: string;
  status?: QueueStatus;
  behind?: {
    deviceId: string;
    lastSyncedTick: number;
    urgent: boolean;
  };
};
export type ReqBody = {
  deviceId: string;
  urgent: boolean;
  lastSyncedTick: number;
};
export type ReqQuery = Record<string, never>;
