import { Request } from 'express';
import { Route } from '@tupaia/server-boilerplate';
import { SyncSessionPullMetadataRequest } from '@tupaia/types';

export type SyncSessionPullMetadataRequest = Request<
  SyncSessionPullMetadataRequest.Params,
  SyncSessionPullMetadataRequest.ResBody,
  SyncSessionPullMetadataRequest.ReqBody,
  SyncSessionPullMetadataRequest.ReqQuery
>;

export class SyncSessionPullMetadataRoute extends Route<SyncSessionPullMetadataRequest> {
  public async buildResponse() {
    return { totalToPull: 10, pullUntil: 10 };
  }
}
