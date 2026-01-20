import { Request } from 'express';

import { Route } from '@tupaia/server-boilerplate';
import { SyncServerPushCompleteRequest } from '@tupaia/types';

export type SyncPushCompleteRequest = Request<
  SyncServerPushCompleteRequest.Params,
  SyncServerPushCompleteRequest.ResBody,
  SyncServerPushCompleteRequest.ReqBody,
  SyncServerPushCompleteRequest.ReqQuery
>;

export class SyncPushCompleteRoute extends Route<SyncPushCompleteRequest> {
  public async buildResponse() {
    const { ctx } = this.req;
    const { sessionId } = this.req.params;
    const { deviceId } = this.req.body;
    await ctx.centralSyncManager.completePush(sessionId, deviceId);
    return {};
  }
}
