import { Request } from 'express';

import { Route } from '@tupaia/server-boilerplate';
import { SyncServerPullMetadataRequest } from '@tupaia/types';

export type SyncPullMetadataRequest = Request<
  SyncServerPullMetadataRequest.Params,
  SyncServerPullMetadataRequest.ResBody,
  SyncServerPullMetadataRequest.ReqBody,
  SyncServerPullMetadataRequest.ReqQuery
>;

export class SyncPullMetadataRoute extends Route<SyncPullMetadataRequest> {
  public async buildResponse() {
    const { ctx } = this.req;
    const { sessionId } = this.req.params;
    const { centralSyncManager } = ctx;
    return centralSyncManager.fetchPullMetadata(sessionId);
  }
}
