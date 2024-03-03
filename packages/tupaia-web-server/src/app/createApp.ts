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

export async function createApp(db: TupaiaDatabase = new TupaiaDatabase()) {
  const builder = new OrchestratorApiBuilder(db, 'tupaia-web', { attachModels: true })
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
      'dashboards/:projectCode/:entityCode/:dashboardCode/export',
      handleWith(routes.ExportDashboardRoute),
    )
    .post<routes.EmailDashboardRequest>(
      'dashboards/:projectCode/:entityCode/:dashboardCode/email',
      handleWith(routes.EmailDashboardRoute),
    )
    .get<routes.ProjectCountryAccessListRequest>(
      'countryAccessList/:projectCode',
      handleWith(routes.ProjectCountryAccessListRoute),
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
    .post<routes.SubscribeDashboardRequest>(
      'dashboard/:projectCode/:entityCode/:dashboardCode/subscribe',
      handleWith(routes.SubscribeDashboardRoute),
    )
    .put<routes.UnsubscribeDashboardRequest>(
      'dashboard/:projectCode/:entityCode/:dashboardCode/unsubscribe',
      handleWith(routes.UnsubscribeDashboardRoute),
    )
    .put<routes.UnsubscribeDashboardMailingListRequest>(
      'dashboardMailingList/:mailingListId/unsubscribe',
      handleWith(routes.UnsubscribeDashboardMailingListRoute),
    )
    .use('downloadFiles', forwardRequest(CENTRAL_API_URL, { authHandlerProvider }))
    // Forward everything else to webConfigApi
    .use('*', forwardRequest(WEB_CONFIG_API_URL, { authHandlerProvider }));
  const app = builder.build();

  await builder.initialiseApiClient([
    { entityCode: 'DL', permissionGroupName: 'Public' }, //	Demo Land
    { entityCode: 'FJ', permissionGroupName: 'Public' }, //	Fiji
    { entityCode: 'CK', permissionGroupName: 'Public' }, //	Cook Islands
    { entityCode: 'PG', permissionGroupName: 'Public' }, //	Papua New Guinea
    { entityCode: 'SB', permissionGroupName: 'Public' }, //	Solomon Islands
    { entityCode: 'TK', permissionGroupName: 'Public' }, //	Tokelau
    { entityCode: 'VE', permissionGroupName: 'Public' }, //	Venezuela
    { entityCode: 'WS', permissionGroupName: 'Public' }, //	Samoa
    { entityCode: 'KI', permissionGroupName: 'Public' }, //	Kiribati
    { entityCode: 'TO', permissionGroupName: 'Public' }, //	Tonga
    { entityCode: 'NG', permissionGroupName: 'Public' }, //	Nigeria
    { entityCode: 'VU', permissionGroupName: 'Public' }, //	Vanuatu
    { entityCode: 'AU', permissionGroupName: 'Public' }, //	Australia
    { entityCode: 'PW', permissionGroupName: 'Public' }, //	Palau
    { entityCode: 'NU', permissionGroupName: 'Public' }, //	Niue
    { entityCode: 'TV', permissionGroupName: 'Public' }, //	Tuvalu
  ]);

  return app;
}
