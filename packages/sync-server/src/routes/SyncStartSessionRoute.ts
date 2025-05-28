import { Request } from 'express';
import { Route } from '@tupaia/server-boilerplate';
import { SyncServerStartSessionRequest } from '@tupaia/types';

export type SyncStartSessionRequest = Request<
  SyncServerStartSessionRequest.Params,
  SyncServerStartSessionRequest.ResBody,
  SyncServerStartSessionRequest.ReqBody,
  SyncServerStartSessionRequest.ReqQuery
>;

export class SyncStartSessionRoute extends Route<SyncStartSessionRequest> {
  public async buildResponse() {
    const { ctx } = this.req;

    const { sessionId } = await ctx.centralSyncManager.startSession();

    return {
      sessionId,
    };
  }
}
