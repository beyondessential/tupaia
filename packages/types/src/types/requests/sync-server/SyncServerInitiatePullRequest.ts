export type Params = {
  sessionId: string;
};
export type ResBody = {};
export type ReqBody = {
  since: string;
  projectIds: string[];
  userId: string;
  deviceId: string;
};
export type ReqQuery = Record<string, never>;
