import { Request } from 'express';

import { Route } from '@tupaia/server-boilerplate';
import { DatatrakWebSyncPushCompleteRequest } from '@tupaia/types';

export type SyncPushCompleteRequest = Request<
  DatatrakWebSyncPushCompleteRequest.Params,
  DatatrakWebSyncPushCompleteRequest.ResBody,
  DatatrakWebSyncPushCompleteRequest.ReqBody,
  DatatrakWebSyncPushCompleteRequest.ReqQuery
>;

export class SyncPushCompleteRoute extends Route<SyncPushCompleteRequest> {
  protected readonly type = 'stream';

  public async stream() {
    const { params, body, ctx } = this.req;
    const { sessionId } = params;
    const { deviceId } = body;
    return ctx.services.sync.completePush(this.res, sessionId, deviceId);
  }
}
