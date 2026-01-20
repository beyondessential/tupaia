import { Request } from 'express';
import { Route } from '@tupaia/server-boilerplate';
import { SyncServerInitiatePullRequest } from '@tupaia/types';

export type SyncInitiatePullRequest = Request<
  SyncServerInitiatePullRequest.Params,
  SyncServerInitiatePullRequest.ResBody,
  SyncServerInitiatePullRequest.ReqBody,
  SyncServerInitiatePullRequest.ReqQuery
>;

export class SyncInitiatePullRoute extends Route<SyncInitiatePullRequest> {
  public async buildResponse() {
    const { ctx } = this.req;
    const { sessionId } = this.req.params;
    const { accessPolicy } = this.req;
    const { since: sinceString, projectIds, userId, deviceId } = this.req.body;
    const since = parseInt(sinceString, 10);
    if (isNaN(since)) {
      throw new Error('Must provide "since" when creating a pull filter, even if it is 0');
    }
    await ctx.centralSyncManager.initiatePull(
      sessionId,
      {
        since,
        projectIds,
        userId,
        deviceId,
      },
      accessPolicy,
    );
    return {};
  }
}
