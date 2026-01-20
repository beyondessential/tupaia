export type Params = {};

export type ResBody = void;

export type ReqBody = {
  deviceId: string;
  urgent: boolean;
  lastSyncedTick: number;
};

export type ReqQuery = Record<string, never>;
