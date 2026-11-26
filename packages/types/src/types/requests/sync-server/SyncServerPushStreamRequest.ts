export type Params = {
  sessionId: string;
};

export type ResBody = {};
// The streaming push reads framed changes directly off the request stream; it never parses
// `req.body`, so the body type is `never` to make that contract explicit and stop future readers
// assuming `req.body.changes` is available (it is not).
export type ReqBody = never;
export type ReqQuery = Record<string, never>;
