export type Params = {
  sessionId: string;
};

export type ResBody = {
  status: 'ready' | 'pending';
};
export type ReqBody = Record<string, never>;
export type ReqQuery = Record<string, never>;
