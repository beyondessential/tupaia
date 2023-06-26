/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { Request } from 'express';
import { TupaiaDatabase } from '@tupaia/database';
import {
  OrchestratorApiBuilder,
  handleWith,
  useForwardUnhandledRequests,
  attachSessionIfAvailable,
  SessionSwitchingAuthHandler,
} from '@tupaia/server-boilerplate';
import { TupaiaWebSessionModel } from '../models';
import {
  DashboardsRoute,
  EntitiesRoute,
  ReportRoute,
  LegacyDashboardReportRoute,
  UserRoute,
  TempLogoutRoute,
  ProjectRoute,

  DashboardsRequest,
  EntitiesRequest,
  ReportRequest,
  LegacyDashboardReportRequest,
  UserRequest,
  TempLogoutRequest,
  ProjectRequest,
  CountryAccessListRequest,
  CountryAccessListRoute,
  RequestCountryAccessRequest,
  RequestCountryAccessRoute,
} from '../routes';

const { WEB_CONFIG_API_URL = 'http://localhost:8000/api/v1' } = process.env;

const authHandlerProvider = (req: Request) => new SessionSwitchingAuthHandler(req);

export function createApp() {
  const app = new OrchestratorApiBuilder(new TupaiaDatabase(), 'tupaia-web')
    .useSessionModel(TupaiaWebSessionModel)
    .useAttachSession(attachSessionIfAvailable)
    .attachApiClientToContext(authHandlerProvider)
    .get<ReportRequest>('report/:reportCode', handleWith(ReportRoute))
    .get<LegacyDashboardReportRequest>('legacyDashboardReport/:reportCode', handleWith(LegacyDashboardReportRoute))
    .get<ProjectRequest>('project/:projectCode', handleWith(ProjectRoute))
    .get<UserRequest>('getUser', handleWith(UserRoute))
    .get<DashboardsRequest>('dashboards/:projectCode/:entityCode', handleWith(DashboardsRoute))
    .get<CountryAccessListRequest>('countryAccessList', handleWith(CountryAccessListRoute))
    .post<RequestCountryAccessRequest>(
      'requestCountryAccess',
      handleWith(RequestCountryAccessRoute),
    )
    .get<EntitiesRequest>('entities/:hierarchyName/:rootEntityCode', handleWith(EntitiesRoute))
    // TODO: Stop using get for logout, then delete this
    .get<TempLogoutRequest>('logout', handleWith(TempLogoutRoute))
    .build();

  useForwardUnhandledRequests(
    app,
    WEB_CONFIG_API_URL,
    '',
    attachSessionIfAvailable,
    authHandlerProvider,
  );

  return app;
}
