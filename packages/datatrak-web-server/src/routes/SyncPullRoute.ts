import { Request } from 'express';

import { Route } from '@tupaia/server-boilerplate';
import { DatatrakWebSyncPullRequest } from '@tupaia/types';

export type SyncPullRequest = Request<
  DatatrakWebSyncPullRequest.Params,
  DatatrakWebSyncPullRequest.ResBody,
  DatatrakWebSyncPullRequest.ReqBody,
  DatatrakWebSyncPullRequest.ReqQuery
>;

export class SyncPullRoute extends Route<SyncPullRequest> {
  // Pipe the stream data from sync server to the client
  protected readonly type = 'pipe';

  public async pipe() {
    const { ctx } = this.req;
    const { sessionId } = this.req.params;
    return ctx.services.sync.pull(this.res, sessionId);
  }
}
