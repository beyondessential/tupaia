import { Request } from 'express';

import { Route } from '@tupaia/server-boilerplate';
import { DatatrakWebSyncPushRequest } from '@tupaia/types';

// Reuses the buffered push request type: the params (sessionId) are identical, and the framed body
// is forwarded straight through rather than read from `req.body`.
export type SyncPushStreamRequest = Request<
  DatatrakWebSyncPushRequest.Params,
  DatatrakWebSyncPushRequest.ResBody,
  DatatrakWebSyncPushRequest.ReqBody,
  DatatrakWebSyncPushRequest.ReqQuery
>;

export class SyncPushStreamRoute extends Route<SyncPushStreamRequest> {
  public async buildResponse() {
    const { params, ctx } = this.req;
    const { sessionId } = params;

    // The global bodyParser.json is a no-op for `application/json+frame`, so the request body is
    // still an unconsumed readable stream. Forward it straight to the micro server without
    // buffering or re-serialising.
    await ctx.services.sync.pushStream(sessionId, this.req);
    return {};
  }
}
