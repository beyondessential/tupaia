import { Request } from 'express';
import { Route } from '@tupaia/server-boilerplate';
import { SyncSessionRequest } from '@tupaia/types';

export type SyncSessionRequest = Request<
  SyncSessionRequest.Params,
  SyncSessionRequest.ResBody,
  SyncSessionRequest.ReqBody,
  SyncSessionRequest.ReqQuery
>;

export class SyncSessionRoute extends Route<SyncSessionRequest> {
  public async buildResponse() {
    const { ctx } = this.req;

    const { sessionId } = await ctx.centralSyncManager.startSession();

    return {
      sessionId,
    };
  }
}
