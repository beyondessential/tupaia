import { Request } from 'express';

import { Route } from '@tupaia/server-boilerplate';
import { DatatrakWebSyncStartSessionRequest } from '@tupaia/types';

export type SyncStartSessionRequest = Request<
  DatatrakWebSyncStartSessionRequest.Params,
  DatatrakWebSyncStartSessionRequest.ResBody,
  DatatrakWebSyncStartSessionRequest.ReqBody,
  DatatrakWebSyncStartSessionRequest.ReqQuery
>;

export class SyncStartSessionRoute extends Route<SyncStartSessionRequest> {
  protected readonly type = 'stream';

  public async stream() {
    const { ctx } = this.req;
    const { deviceId, urgent, lastSyncedTick } = this.req.body;
    return ctx.services.sync.startSyncSession(this.res, deviceId, urgent, lastSyncedTick);
  }
}
