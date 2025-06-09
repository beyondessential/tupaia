import { Request } from 'express';

import { Route } from '@tupaia/server-boilerplate';
import { SyncServerSyncMetadataRequest } from '@tupaia/types';

export type SyncMetadataRequest = Request<
  SyncServerSyncMetadataRequest.Params,
  SyncServerSyncMetadataRequest.ResBody,
  SyncServerSyncMetadataRequest.ReqBody,
  SyncServerSyncMetadataRequest.ReqQuery
>;

export class SyncMetadataRoute extends Route<SyncMetadataRequest> {
  public async buildResponse() {
    const { ctx } = this.req;
    const { sessionId } = this.req.params;
    return ctx.centralSyncManager.fetchSyncMetadata(sessionId);
  }
}
