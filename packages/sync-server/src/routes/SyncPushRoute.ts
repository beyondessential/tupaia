import { Request } from 'express';

import { Route } from '@tupaia/server-boilerplate';
import { SyncServerPushRequest } from '@tupaia/types';

export type SyncPushRequest = Request<
  SyncServerPushRequest.Params,
  SyncServerPushRequest.ResBody,
  SyncServerPushRequest.ReqBody,
  SyncServerPushRequest.ReqQuery
>;

export class SyncPushRoute extends Route<SyncPushRequest> {
  public async buildResponse() {
    const { ctx } = this.req;
    const { sessionId } = this.req.params;
    const { changes } = this.req.body;
    await ctx.centralSyncManager.addIncomingChanges(sessionId, changes);
    return {};
  }
}
