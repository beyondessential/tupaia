import { Request } from 'express';
import { Route } from '@tupaia/server-boilerplate';
import { SyncSessionInitiatePullRequest } from '@tupaia/types';

export type SyncSessionInitiatePullRequest = Request<
  SyncSessionInitiatePullRequest.Params,
  SyncSessionInitiatePullRequest.ResBody,
  SyncSessionInitiatePullRequest.ReqBody,
  SyncSessionInitiatePullRequest.ReqQuery
>;

export class SyncSessionInitiatePullRoute extends Route<SyncSessionInitiatePullRequest> {
  public async buildResponse() {
    const { ctx } = this.req;
    const { sessionId } = this.req.params;
    const { since: sinceString, projectIds, deviceId } = this.req.body;
    const since = parseInt(sinceString, 10);
    if (isNaN(since)) {
      throw new Error('Must provide "since" when creating a pull filter, even if it is 0');
    }
    await ctx.centralSyncManager.initiatePull(sessionId, {
      since,
      projectIds,
      deviceId,
    });
    return {};
  }
}
