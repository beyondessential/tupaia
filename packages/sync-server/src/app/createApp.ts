import { Request, Response, NextFunction } from 'express';

import { ForwardingAuthHandler } from '@tupaia/api-client';
import { TupaiaDatabase } from '@tupaia/database';
import { MicroServiceApiBuilder, handleWith } from '@tupaia/server-boilerplate';

import { CentralSyncManager } from '../sync';
import { SyncSessionRequest, SyncSessionRoute } from '../routes/SyncSessionRoute';
import { SyncSessionReadyRequest, SyncSessionReadyRoute } from '../routes/SyncSessionReadyRoute';
import {
  SyncSessionMetadataRequest,
  SyncSessionMetadataRoute,
} from '../routes/SyncSessionMetadataRoute';
import {
  SyncSessionInitiatePullRequest,
  SyncSessionInitiatePullRoute,
} from '../routes/SyncSessionInitiatePullRoute';
import {
  SyncSessionPullReadyRequest,
  SyncSessionPullReadyRoute,
} from '../routes/SyncSessionPullReadyRoute';
import {
  SyncSessionPullMetadataRequest,
  SyncSessionPullMetadataRoute,
} from '../routes/SyncSessionPullMetadataRoute';
import { SyncSessionPullRequest, SyncSessionPullRoute } from '../routes/SyncSessionPullRoute';
import { EndSyncSessionRequest, EndSyncSessionRoute } from '../routes/EndSyncSessionRoute';

export const initializeCentralSyncManager =
  (centralSyncManager: CentralSyncManager) => (req: Request, res: Response, next: NextFunction) => {
    req.ctx.centralSyncManager = centralSyncManager;
    next();
  };

/**
 * Set up express server with middleware,
 */
export function createApp(database = new TupaiaDatabase(), syncManager: CentralSyncManager) {
  const app = new MicroServiceApiBuilder(database, 'sync')
    .attachApiClientToContext(req => new ForwardingAuthHandler(req.headers.authorization))
    .useMiddleware(initializeCentralSyncManager(syncManager))
    .post<SyncSessionRequest>('sync', handleWith(SyncSessionRoute))
    .get<SyncSessionReadyRequest>('sync/:sessionId/ready', handleWith(SyncSessionReadyRoute))
    .get<SyncSessionMetadataRequest>(
      'sync/:sessionId/metadata',
      handleWith(SyncSessionMetadataRoute),
    )
    .post<SyncSessionInitiatePullRequest>(
      'sync/:sessionId/pull/initiate',
      handleWith(SyncSessionInitiatePullRoute),
    )
    .get<SyncSessionPullReadyRequest>(
      'sync/:sessionId/pull/ready',
      handleWith(SyncSessionPullReadyRoute),
    )
    .get<SyncSessionPullMetadataRequest>(
      'sync/:sessionId/pull/metadata',
      handleWith(SyncSessionPullMetadataRoute),
    )
    .get<SyncSessionPullRequest>('sync/:sessionId/pull', handleWith(SyncSessionPullRoute))
    .delete<EndSyncSessionRequest>('sync/:sessionId', handleWith(EndSyncSessionRoute))

    // .useBasicBearerAuth() // TODO: uncomment this when we have a way to pass the auth token
    .build();

  return app;
}
