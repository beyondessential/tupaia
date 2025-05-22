import { Request, Response } from 'express';

import { Route } from '@tupaia/server-boilerplate';
import { SyncSessionPullRequest } from '@tupaia/types';
import { findSyncSnapshotRecords, SYNC_SESSION_DIRECTION } from '@tupaia/sync';

export type SyncSessionPullRequest = Request<
  SyncSessionPullRequest.Params,
  SyncSessionPullRequest.ResBody,
  SyncSessionPullRequest.ReqBody,
  SyncSessionPullRequest.ReqQuery
>;

export class SyncSessionPullRoute extends Route<SyncSessionPullRequest> {
  protected readonly type = 'stream';

  public async stream() {
    const { models } = this.req;

    return findSyncSnapshotRecords(
      this.res,
      models.database,
      this.req.params.sessionId,
      SYNC_SESSION_DIRECTION.OUTGOING,
    );
  }
}
