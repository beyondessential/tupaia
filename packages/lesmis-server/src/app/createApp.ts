/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import { IncomingMessage, ServerResponse } from 'http';
import { TupaiaDatabase } from '@tupaia/database';
import { LesmisSessionModel } from '../models';
import { createProxyMiddleware, fixRequestBody } from 'http-proxy-middleware';
import { Express } from 'express';
import { OrchestratorApiBuilder, handleWith, handleError } from '@tupaia/server-boilerplate';
import {
  DashboardRoute,
  EntityRoute,
  EntitiesRoute,
  MapOverlaysRoute,
  RegisterRoute,
  ReportRoute,
  UserRoute,
  UsersRoute,
  UpdateUserEntityPermissionRoute,
} from '../routes';
import { attachSession } from '../session';
import { hasLesmisAccess } from '../utils';

import { Request, Response, NextFunction } from 'express';

import { UnauthenticatedError } from '@tupaia/utils';

export const attachAuthorizationHeader = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { session } = req;

  if (!session) {
    throw new UnauthenticatedError('Session is not attached');
  }

  req.headers.authorization = await session.getAuthHeader();

  next();
};

const useForwardUnhandledRequestsToMeditrak = (app: Express) => {
  const { MEDITRAK_API_URL = 'http://localhost:8090/v2' } = process.env;

  const options = {
    target: MEDITRAK_API_URL,
    changeOrigin: true,
    pathRewrite: (path: string, req: IncomingMessage) => {
      // Remove the version string because version is already included in Meditrak base url.

      if (req.path.startsWith('/v')) {
        const secondSlashIndex = req.path.indexOf('/', 2);
        const version = parseFloat(req.path.substring(2, secondSlashIndex));
        const out = path.replace(`/v${version}`, '');
        console.log('path rewrite out', out);
        return out;
      }
      return path;
    },
    onProxyReq: fixRequestBody,
    onProxyRes: (proxyRes: IncomingMessage, req: IncomingMessage, res: ServerResponse) => {
      // To get around CORS because Admin Panel has credentials: true in fetch for session cookies
      // eslint-disable-next-line no-param-reassign
      proxyRes.headers['Access-Control-Allow-Origin'] = res.get('Access-Control-Allow-Origin');
    },
  };

  // Forward any unhandled request to meditrak-server
  app.use(attachSession, attachAuthorizationHeader, createProxyMiddleware(options), handleError);
};

/**
 * Set up express server with middleware,
 */
export function createApp() {
  const app = new OrchestratorApiBuilder(new TupaiaDatabase())
    .useSessionModel(LesmisSessionModel)
    .useAttachSession(attachSession)
    .verifyLogin(hasLesmisAccess)
    .get('/v1/dashboard/:entityCode', handleWith(DashboardRoute))
    .get('/v1/user', handleWith(UserRoute))
    .get('/v1/users', handleWith(UsersRoute))
    .get('/v1/entities/:entityCode', handleWith(EntitiesRoute))
    .get('/v1/map-overlays/:entityCode', handleWith(MapOverlaysRoute))
    .get('/v1/entity/:entityCode', handleWith(EntityRoute))
    .get('/v1/report/:entityCode/:reportCode', handleWith(ReportRoute))
    .post('/v1/register', handleWith(RegisterRoute))
    .post('/v1/report/:entityCode/:reportCode', handleWith(ReportRoute))
    .put('/v1/userEntityPermission', handleWith(UpdateUserEntityPermissionRoute))
    .build();

  // Forward any unhandled request to meditrak-server
  useForwardUnhandledRequestsToMeditrak(app);

  return app;
}
