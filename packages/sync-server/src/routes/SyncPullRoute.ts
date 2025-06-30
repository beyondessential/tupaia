import { Request } from 'express';

import { Route } from '@tupaia/server-boilerplate';
import { SyncServerPullRequest } from '@tupaia/types';
import { streamSnapshotData, SYNC_SESSION_DIRECTION } from '@tupaia/sync';

export type SyncPullRequest = Request<
  SyncServerPullRequest.Params,
  SyncServerPullRequest.ResBody,
  SyncServerPullRequest.ReqBody,
  SyncServerPullRequest.ReqQuery
>;

export class SyncPullRoute extends Route<SyncPullRequest> {
  protected readonly type = 'stream';

  public async stream() {
    const { models } = this.req;

    return streamSnapshotData(
      this.res,
      models.database,
      this.req.params.sessionId,
      SYNC_SESSION_DIRECTION.OUTGOING,
    );
  }
}
