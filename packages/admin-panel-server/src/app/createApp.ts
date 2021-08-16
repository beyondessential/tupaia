/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { IncomingMessage, ServerResponse } from 'http';
import { Express } from 'express';
import { createProxyMiddleware, fixRequestBody } from 'http-proxy-middleware';

import { TupaiaDatabase } from '@tupaia/database';
import {
  OrchestratorApiBuilder,
  attachSession,
  handleWith,
  handleError,
} from '@tupaia/server-boilerplate';

import { AdminPanelSessionModel } from '../models';
import { hasTupaiaAdminPanelAccess } from '../utils';
import { attachAuthorizationHeader, verifyBESAdminAccess } from '../middleware';
import {
  UserRoute,
  FetchHierarchyEntitiesRoute,
  FetchReportPreviewDataRoute,
  SaveDashboardVisualisationRoute,
  FetchDashboardVisualisationRoute,
} from '../routes';

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
        return path.replace(`/v${version}`, '');
      }
      return path;
    },
    onProxyReq: fixRequestBody,
    onProxyRes: function (proxyRes: IncomingMessage, req: IncomingMessage, res: ServerResponse) {
      // To get around CORS because Admin Panel has credentials: true in fetch for session cookies
      proxyRes.headers['Access-Control-Allow-Origin'] = res.get('Access-Control-Allow-Origin');
    },
  };

  //Forward any unhandled request to meditrak-server
  app.use(attachSession, attachAuthorizationHeader, createProxyMiddleware(options), handleError);
};

/**
 * Set up express server with middleware,
 */
export function createApp() {
  const app = new OrchestratorApiBuilder(new TupaiaDatabase())
    .useSessionModel(AdminPanelSessionModel)
    .verifyLogin(hasTupaiaAdminPanelAccess)
    .get('/v1/user', handleWith(UserRoute))
    .get(
      '/v1/hierarchy/:hierarchyName/:entityCode',
      verifyBESAdminAccess,
      handleWith(FetchHierarchyEntitiesRoute),
    )
    .post(
      '/v1/fetchReportPreviewData',
      verifyBESAdminAccess,
      handleWith(FetchReportPreviewDataRoute),
    )
    .post(
      '/v1/dashboardVisualisation',
      verifyBESAdminAccess,
      handleWith(SaveDashboardVisualisationRoute),
    )
    .put(
      '/v1/dashboardVisualisation/:dashboardVisualisationId',
      verifyBESAdminAccess,
      handleWith(SaveDashboardVisualisationRoute),
    )
    .get(
      '/v1/dashboardVisualisation/:dashboardVisualisationId',
      verifyBESAdminAccess,
      handleWith(FetchDashboardVisualisationRoute),
    )
    .build();

  useForwardUnhandledRequestsToMeditrak(app);

  return app;
}
