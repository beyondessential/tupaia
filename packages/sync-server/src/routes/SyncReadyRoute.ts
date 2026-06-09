import { Request } from 'express';

import { Route } from '@tupaia/server-boilerplate';
import { SyncServerSyncReadyRequest } from '@tupaia/types';

export type SyncReadyRequest = Request<
  SyncServerSyncReadyRequest.Params,
  SyncServerSyncReadyRequest.ResBody,
  SyncServerSyncReadyRequest.ReqBody,
  SyncServerSyncReadyRequest.ReqQuery
>;

export class SyncReadyRoute extends Route<SyncReadyRequest> {
  public async buildResponse() {
    const { ctx } = this.req;
    const { sessionId } = this.req.params;
    const ready = await ctx.centralSyncManager.checkSessionReady(sessionId);
    return {
      status: ready
        ? SyncServerSyncReadyRequest.SyncReadyStatus.READY
        : SyncServerSyncReadyRequest.SyncReadyStatus.PENDING,
    };
  }
}
