/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { Request } from 'express';
import { TupaiaDatabase } from '@tupaia/database';
import {
  OrchestratorApiBuilder,
  handleWith,
  attachSessionIfAvailable,
  SessionSwitchingAuthHandler,
  forwardRequest,
} from '@tupaia/server-boilerplate';
import { TupaiaWebSessionModel } from '../models';
import * as routes from '../routes';
import { attachAccessPolicy } from './middleware';

const {
  WEB_CONFIG_API_URL = 'http://localhost:8000/api/v1',
  CENTRAL_API_URL = 'http://localhost:8090/v2',
} = process.env;

const authHandlerProvider = (req: Request) => new SessionSwitchingAuthHandler(req);

export function createApp(db: TupaiaDatabase = new TupaiaDatabase()) {
  const app = new OrchestratorApiBuilder(db, 'tupaia-web', { attachModels: true })
    .useSessionModel(TupaiaWebSessionModel)
    .useAttachSession(attachSessionIfAvailable)
    .attachApiClientToContext(authHandlerProvider)
    .use('*', attachAccessPolicy)
    .get<routes.ReportRequest>('report/:reportCode', handleWith(routes.ReportRoute))
    .get<routes.LegacyDashboardReportRequest>(
      'legacyDashboardReport/:reportCode',
      handleWith(routes.LegacyDashboardReportRoute),
    )
    .get<routes.LegacyMapOverlayReportRequest>(
      'legacyMapOverlayReport/:mapOverlayCode',
      handleWith(routes.LegacyMapOverlayReportRoute),
    )
    .get<routes.MapOverlaysRequest>(
      'mapOverlays/:projectCode/:entityCode',
      handleWith(routes.MapOverlaysRoute),
    )
    .get<routes.ProjectRequest>('project/:projectCode', handleWith(routes.ProjectRoute))
    .get<routes.UserRequest>('getUser', handleWith(routes.UserRoute))
    .get<routes.DashboardsRequest>(
      'dashboards/:projectCode/:entityCode',
      handleWith(routes.DashboardsRoute),
    )
    .post<routes.ExportDashboardRequest>(
      'dashboards/:projectCode/:entityCode/:dashboardName/export',
      handleWith(routes.ExportDashboardRoute),
    )
    .post<routes.EmailDashboardRequest>(
      'dashboards/:projectCode/:entityCode/:dashboardName/email',
      handleWith(routes.EmailDashboardRoute),
    )
    .get<routes.CountryAccessListRequest>(
      'countryAccessList',
      handleWith(routes.CountryAccessListRoute),
    )
    .post<routes.RequestCountryAccessRequest>(
      'requestCountryAccess',
      handleWith(routes.RequestCountryAccessRoute),
    )
    .get<routes.EntityRequest>('entity/:projectCode/:entityCode', handleWith(routes.EntityRoute))
    .get<routes.EntitiesRequest>(
      'entities/:projectCode/:rootEntityCode',
      handleWith(routes.EntitiesRoute),
    )
    .get<routes.EntitySearchRequest>(
      'entitySearch/:projectCode',
      handleWith(routes.EntitySearchRoute),
    )
    .get<routes.EntityAncestorsRequest>(
      'entityAncestors/:projectCode/:rootEntityCode',
      handleWith(routes.EntityAncestorsRoute),
    )
    .get<routes.ExportSurveyResponsesRequest>(
      'export/surveyResponses',
      handleWith(routes.ExportSurveyResponsesRoute),
    )
    .post<routes.ChangePasswordRequest>('changePassword', handleWith(routes.ChangePasswordRoute))
    .post<routes.SubscribeRequest>(
      'dashboard/:projectCode/:entityCode/:dashboardCode/subscribe',
      handleWith(routes.SubscribeRoute),
    )
    .put<routes.UnsubscribeRequest>(
      'dashboard/:projectCode/:entityCode/:dashboardCode/unsubscribe',
      handleWith(routes.UnsubscribeRoute),
    )
    .use('downloadFiles', forwardRequest(CENTRAL_API_URL, { authHandlerProvider }))
    // Forward everything else to webConfigApi
    .use('*', forwardRequest(WEB_CONFIG_API_URL, { authHandlerProvider }))
    .build();

  return app;
}
