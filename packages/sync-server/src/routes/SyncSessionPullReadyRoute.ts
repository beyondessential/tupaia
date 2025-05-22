import { Request } from 'express';
import { Route } from '@tupaia/server-boilerplate';
import { SyncSessionPullReadyRequest } from '@tupaia/types';

export type SyncSessionPullReadyRequest = Request<
  SyncSessionPullReadyRequest.Params,
  SyncSessionPullReadyRequest.ResBody,
  SyncSessionPullReadyRequest.ReqBody,
  SyncSessionPullReadyRequest.ReqQuery
>;

export class SyncSessionPullReadyRoute extends Route<SyncSessionPullReadyRequest> {
  public async buildResponse() {
    const { ctx } = this.req;
    const { sessionId } = this.req.params;
    return ctx.centralSyncManager.checkPullReady(sessionId);
  }
}
