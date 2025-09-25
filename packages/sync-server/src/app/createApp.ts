import { Request, Response, NextFunction } from 'express';

import { ForwardingAuthHandler } from '@tupaia/api-client';
import { TupaiaDatabase } from '@tupaia/database';
import { MicroServiceApiBuilder, handleWith } from '@tupaia/server-boilerplate';

import { CentralSyncManager } from '../sync';
import { SyncStartSessionRequest, SyncStartSessionRoute } from '../routes/SyncStartSessionRoute';
import { SyncReadyRequest, SyncReadyRoute } from '../routes/SyncReadyRoute';
import { SyncPullReadyRequest, SyncPullReadyRoute } from '../routes/SyncPullReadyRoute';
import { SyncMetadataRequest, SyncMetadataRoute } from '../routes/SyncMetadataRoute';
import { SyncInitiatePullRequest, SyncInitiatePullRoute } from '../routes/SyncInitiatePullRoute';
import { SyncPullMetadataRequest, SyncPullMetadataRoute } from '../routes/SyncPullMetadataRoute';
import { SyncPullRequest, SyncPullRoute } from '../routes/SyncPullRoute';
import { SyncEndSessionRequest, SyncEndSessionRoute } from '../routes/SyncEndSessionRoute';
import { SyncPushRequest, SyncPushRoute } from '../routes/SyncPushRoute';
import { SyncPushStatusRequest, SyncPushStatusRoute } from '../routes/SyncPushStatusRoute';
import { SyncPushCompleteRequest, SyncPushCompleteRoute } from '../routes/SyncPushCompleteRoute';

export const addCentralSyncManagerToContext =
  (centralSyncManager: CentralSyncManager) =>
  (req: Request, _res: Response, next: NextFunction) => {
    req.ctx.centralSyncManager = centralSyncManager;
    next();
  };

/**
 * Set up express server with middleware,
 */
export function createApp(database = new TupaiaDatabase(), syncManager: CentralSyncManager) {
  const app = new MicroServiceApiBuilder(database, 'sync')
    .attachApiClientToContext(req => new ForwardingAuthHandler(req.headers.authorization))
    .useMiddleware(addCentralSyncManagerToContext(syncManager))
    .useBasicBearerAuth()
    .post<SyncStartSessionRequest>('sync', handleWith(SyncStartSessionRoute))
    .get<SyncReadyRequest>('sync/:sessionId/status', handleWith(SyncReadyRoute))
    .get<SyncMetadataRequest>('sync/:sessionId/metadata', handleWith(SyncMetadataRoute))
    .post<SyncInitiatePullRequest>(
      'sync/:sessionId/pull',
      handleWith(SyncInitiatePullRoute),
    )
    .get<SyncPullReadyRequest>('sync/:sessionId/pull/status', handleWith(SyncPullReadyRoute))
    .get<SyncPullMetadataRequest>(
      'sync/:sessionId/pull/metadata',
      handleWith(SyncPullMetadataRoute),
    )
    .get<SyncPullRequest>('sync/:sessionId/pull', handleWith(SyncPullRoute))
    .post<SyncPushRequest>('sync/:sessionId/push', handleWith(SyncPushRoute))
    .put<SyncPushCompleteRequest>('sync/:sessionId/push/complete', handleWith(SyncPushCompleteRoute))
    .get<SyncPushStatusRequest>('sync/:sessionId/push/status', handleWith(SyncPushStatusRoute))
    .delete<SyncEndSessionRequest>('sync/:sessionId', handleWith(SyncEndSessionRoute))

    .build();

  return app;
}
