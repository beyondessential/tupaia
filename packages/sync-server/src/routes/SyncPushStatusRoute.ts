import { Request } from 'express';

import { Route } from '@tupaia/server-boilerplate';
import { SyncServerPushStatusRequest } from '@tupaia/types';

export type SyncPushStatusRequest = Request<
  SyncServerPushStatusRequest.Params,
  SyncServerPushStatusRequest.ResBody,
  SyncServerPushStatusRequest.ReqBody,
  SyncServerPushStatusRequest.ReqQuery
>;

export class SyncPushStatusRoute extends Route<SyncPushStatusRequest> {
  public async buildResponse() {
    const { ctx } = this.req;
    const { sessionId } = this.req.params;
    const ready = await ctx.centralSyncManager.checkPushComplete(sessionId);
    return {
      status: ready
        ? SyncServerPushStatusRequest.SyncPushStatus.COMPLETE
        : SyncServerPushStatusRequest.SyncPushStatus.PENDING,
    };
  }
}
