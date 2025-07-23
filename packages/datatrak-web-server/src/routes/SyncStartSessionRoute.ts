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
  public async buildResponse() {
    const { ctx } = this.req;
    return ctx.services.sync.startSyncSession(this.res);
  }
}
