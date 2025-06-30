import { Request } from 'express';
import { Route } from '@tupaia/server-boilerplate';
import { DatatrakWebSyncEndSessionRequest } from '@tupaia/types';

export type SyncEndSessionRequest = Request<
  DatatrakWebSyncEndSessionRequest.Params,
  DatatrakWebSyncEndSessionRequest.ResBody,
  DatatrakWebSyncEndSessionRequest.ReqBody,
  DatatrakWebSyncEndSessionRequest.ReqQuery
>;

export class SyncEndSessionRoute extends Route<SyncEndSessionRequest> {
  public async buildResponse() {
    const { ctx } = this.req;
    const { sessionId } = this.req.params;
    return ctx.services.sync.endSyncSession(sessionId);
  }
}
