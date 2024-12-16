/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { Request } from 'express';
import { TupaiaDatabase } from '@tupaia/database';
import {
  attachSessionIfAvailable,
  forwardRequest,
  handleWith,
  OrchestratorApiBuilder,
  SessionSwitchingAuthHandler,
} from '@tupaia/server-boilerplate';
import { getEnvVarOrDefault } from '@tupaia/utils';
import { TupaiaWebSessionModel } from '../models';
import * as routes from '../routes';

const authHandlerProvider = (req: Request) => new SessionSwitchingAuthHandler(req);

export async function createApp(db: TupaiaDatabase = new TupaiaDatabase()) {
  const WEB_CONFIG_API_URL = getEnvVarOrDefault(
    'WEB_CONFIG_API_URL',
    'http://localhost:8000/api/v1',
  );
  const CENTRAL_API_URL = getEnvVarOrDefault('CENTRAL_API_URL', 'http://localhost:8090/v2');
  const builder = new OrchestratorApiBuilder(db, 'tupaia-web')
    .useSessionModel(TupaiaWebSessionModel)
    .useAttachSession(attachSessionIfAvailable)
    .attachApiClientToContext(authHandlerProvider)
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
    .get<routes.CountriesRequest>('countries', handleWith(routes.CountriesRoute))
    .post<routes.ExportDashboardRequest>(
      'dashboards/:projectCode/:entityCode/:dashboardCode/export',
      handleWith(routes.ExportDashboardRoute),
    )
    .post<routes.ExportMapOverlayRequest>(
      'mapOverlays/:projectCode/:entityCode/:mapOverlayCode/export',
      handleWith(routes.ExportMapOverlayRoute),
    )
    .post<routes.EmailDashboardRequest>(
      'dashboards/:projectCode/:entityCode/:dashboardCode/email',
      handleWith(routes.EmailDashboardRoute),
    )
    .post<routes.RequestCountryAccessRequest>(
      'requestCountryAccess',
      handleWith(routes.RequestCountryAccessRoute),
    )
    // @ts-ignore LoginRoute types cannot be extended at this time
    .post<routes.LoginRequest>('loginUser', handleWith(routes.LoginRoute))
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
    .get<routes.ExportSurveyDataRequest>(
      'export/surveyDataDownload',
      handleWith(routes.ExportSurveyDataRoute),
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
    .use('me/countries', forwardRequest(CENTRAL_API_URL, { authHandlerProvider }))
    .use('me', forwardRequest(CENTRAL_API_URL, { authHandlerProvider }))
    .use('export/download/:fileName', forwardRequest(CENTRAL_API_URL, { authHandlerProvider }))
    // Forward everything else to webConfigApi
    .use('dashboards', forwardRequest(WEB_CONFIG_API_URL, { authHandlerProvider }))
    .use('export/chart', forwardRequest(WEB_CONFIG_API_URL, { authHandlerProvider }))
    .use('landingPage/:landingPageUrl', forwardRequest(WEB_CONFIG_API_URL, { authHandlerProvider }))
    .use('login/oneTimeLogin', forwardRequest(WEB_CONFIG_API_URL, { authHandlerProvider }))
    .use('logout', forwardRequest(WEB_CONFIG_API_URL, { authHandlerProvider }))
    .use('projects', forwardRequest(WEB_CONFIG_API_URL, { authHandlerProvider }))
    .use('resendEmail', forwardRequest(WEB_CONFIG_API_URL, { authHandlerProvider }))
    .use('signup', forwardRequest(WEB_CONFIG_API_URL, { authHandlerProvider }))
    .use('verifyEmail', forwardRequest(WEB_CONFIG_API_URL, { authHandlerProvider }));
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
