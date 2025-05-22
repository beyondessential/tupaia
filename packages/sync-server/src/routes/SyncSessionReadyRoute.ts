import { Request } from 'express';
import { Route } from '@tupaia/server-boilerplate';
import { SyncSessionReadyRequest } from '@tupaia/types';

export type SyncSessionReadyRequest = Request<
  SyncSessionReadyRequest.Params,
  SyncSessionReadyRequest.ResBody,
  SyncSessionReadyRequest.ReqBody,
  SyncSessionReadyRequest.ReqQuery
>;

export class SyncSessionReadyRoute extends Route<SyncSessionReadyRequest> {
  public async buildResponse() {
    const { ctx } = this.req;
    const { sessionId } = this.req.params;
    return ctx.centralSyncManager.checkSessionReady(sessionId);
  }
}
