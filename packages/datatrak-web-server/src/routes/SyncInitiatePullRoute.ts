import { Request } from 'express';

import { Route } from '@tupaia/server-boilerplate';
import { DatatrakWebSyncInitiatePullRequest } from '@tupaia/types';

export type SyncInitiatePullRequest = Request<
  DatatrakWebSyncInitiatePullRequest.Params,
  DatatrakWebSyncInitiatePullRequest.ResBody,
  DatatrakWebSyncInitiatePullRequest.ReqBody,
  DatatrakWebSyncInitiatePullRequest.ReqQuery
>;

export class SyncInitiatePullRoute extends Route<SyncInitiatePullRequest> {
  protected readonly type = 'stream';

  public async stream() {
    const { ctx } = this.req;
    const { sessionId } = this.req.params;
    const { since: sinceString, projectIds, userId, deviceId } = this.req.body;
    const since = parseInt(sinceString, 10);
    if (isNaN(since)) {
      throw new Error('Must provide "since" when creating a pull filter, even if it is 0');
    }
    return ctx.services.sync.initiatePull(this.res, sessionId, since, userId, projectIds, deviceId);
  }
}
