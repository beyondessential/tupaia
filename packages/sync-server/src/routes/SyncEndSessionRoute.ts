import { Request } from 'express';

import { Route } from '@tupaia/server-boilerplate';
import { SyncServerEndSessionRequest } from '@tupaia/types';

export type SyncEndSessionRequest = Request<
  SyncServerEndSessionRequest.Params,
  SyncServerEndSessionRequest.ResBody,
  SyncServerEndSessionRequest.ReqBody,
  SyncServerEndSessionRequest.ReqQuery
>;

export class SyncEndSessionRoute extends Route<SyncEndSessionRequest> {
  public async buildResponse() {
    const { ctx } = this.req;
    const { sessionId } = this.req.params;
    await ctx.centralSyncManager.endSession(sessionId);
    return { success: true };
  }
}
