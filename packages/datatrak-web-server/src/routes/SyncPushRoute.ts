import { Request } from 'express';

import { Route } from '@tupaia/server-boilerplate';
import { DatatrakWebSyncPushRequest } from '@tupaia/types';

export type SyncPushRequest = Request<
  DatatrakWebSyncPushRequest.Params,
  DatatrakWebSyncPushRequest.ResBody,
  DatatrakWebSyncPushRequest.ReqBody,
  DatatrakWebSyncPushRequest.ReqQuery
>;

export class SyncPushRoute extends Route<SyncPushRequest> {
  public async buildResponse() {
    const { params, body, ctx } = this.req;
    const { sessionId } = params;
    const { changes } = body;
    await ctx.services.sync.push(sessionId, changes);
    return {};
  }
}
