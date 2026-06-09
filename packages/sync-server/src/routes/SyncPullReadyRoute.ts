import { Request } from 'express';

import { Route } from '@tupaia/server-boilerplate';
import { SyncServerPullReadyRequest } from '@tupaia/types';

export type SyncPullReadyRequest = Request<
  SyncServerPullReadyRequest.Params,
  SyncServerPullReadyRequest.ResBody,
  SyncServerPullReadyRequest.ReqBody,
  SyncServerPullReadyRequest.ReqQuery
>;

export class SyncPullReadyRoute extends Route<SyncPullReadyRequest> {
  public async buildResponse() {
    const { ctx } = this.req;
    const { sessionId } = this.req.params;
    const ready = await ctx.centralSyncManager.checkPullReady(sessionId);
    return {
      status: ready
        ? SyncServerPullReadyRequest.SyncPullReadyStatus.READY
        : SyncServerPullReadyRequest.SyncPullReadyStatus.PENDING,
    };
  }
}
