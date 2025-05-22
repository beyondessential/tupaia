import { Request } from 'express';
import { Route } from '@tupaia/server-boilerplate';
import { SyncSessionMetadataRequest } from '@tupaia/types';

export type SyncSessionMetadataRequest = Request<
  SyncSessionMetadataRequest.Params,
  SyncSessionMetadataRequest.ResBody,
  SyncSessionMetadataRequest.ReqBody,
  SyncSessionMetadataRequest.ReqQuery
>;

export class SyncSessionMetadataRoute extends Route<SyncSessionMetadataRequest> {
  public async buildResponse() {
    const { ctx } = this.req;
    const { sessionId } = this.req.params;
    const { startedAtTick } = await ctx.centralSyncManager.fetchSyncMetadata(sessionId);
    return { startedAtTick };
  }
}
