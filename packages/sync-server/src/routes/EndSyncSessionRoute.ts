import { Request } from 'express';
import { Route } from '@tupaia/server-boilerplate';
import { EndSyncSessionRequest } from '@tupaia/types';

export type EndSyncSessionRequest = Request<
  EndSyncSessionRequest.Params,
  EndSyncSessionRequest.ResBody,
  EndSyncSessionRequest.ReqBody,
  EndSyncSessionRequest.ReqQuery
>;

export class EndSyncSessionRoute extends Route<EndSyncSessionRequest> {
  public async buildResponse() {
    const { ctx } = this.req;
    const { sessionId } = this.req.params;
    await ctx.centralSyncManager.endSession(sessionId);
    return { success: true };
  }
}
