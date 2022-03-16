/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { OrchestratorApiBuilder, handleWith } from '@tupaia/server-boilerplate';
import { TupaiaDatabase } from '@tupaia/database';
import {
  SaveWeeklyReportRequest,
  SaveWeeklyReportRoute,
  FetchAlertsRoute,
  FetchAlertsRequest,
  FetchConfirmedWeeklyReportRoute,
  FetchConfirmedWeeklyReportRequest,
  FetchCountries,
  FetchCountriesRequest,
  FetchCountrySites,
  FetchCountrySitesRequest,
  FetchWeeklyReportRoute,
  FetchWeeklyReportRequest,
  ConfirmWeeklyReportRoute,
  ConfirmWeeklyReportRequest,
  ProcessAlertActionRoute,
  ProcessAlertActionRequest,
  DeleteWeeklyReportRoute,
  DeleteWeeklyReportRequest,
  DeleteAlertRoute,
  DeleteAlertRequest,
} from '../routes';
import { PsssSessionModel } from '../models';
import { hasPSSSAccess } from '../utils';

/**
 * Set up express server with middleware,
 */
export function createApp(db = new TupaiaDatabase()) {
  return (
    new OrchestratorApiBuilder(db)
      .useSessionModel(PsssSessionModel)
      .verifyLogin(hasPSSSAccess)

      /**
       * GET routes
       */
      .get<FetchAlertsRequest>('/v1/alerts/:category', handleWith(FetchAlertsRoute))
      .get<FetchConfirmedWeeklyReportRequest>(
        '/v1/confirmedWeeklyReport/:countryCode?',
        handleWith(FetchConfirmedWeeklyReportRoute),
      )
      .get<FetchCountriesRequest>('/v1/country', handleWith(FetchCountries))
      .get<FetchCountrySitesRequest>(
        '/v1/country/:countryCode/sites',
        handleWith(FetchCountrySites),
      )
      .get<FetchWeeklyReportRequest>(
        '/v1/weeklyReport/:countryCode',
        handleWith(FetchWeeklyReportRoute),
      )
      .get<FetchWeeklyReportRequest>(
        '/v1/weeklyReport/:countryCode/:sites?',
        handleWith(FetchWeeklyReportRoute),
      )

      /**
       * POST routes
       */
      .post<ConfirmWeeklyReportRequest>(
        '/v1/confirmedWeeklyReport/:countryCode',
        handleWith(ConfirmWeeklyReportRoute),
      )

      /**
       * PUT routes
       */
      .put<SaveWeeklyReportRequest>(
        '/v1/weeklyReport/:countryCode/:siteCode?',
        handleWith(SaveWeeklyReportRoute),
      )
      .put<ProcessAlertActionRequest>(
        '/v1/alerts/:alertId/:action',
        handleWith(ProcessAlertActionRoute),
      )

      /**
       * DELETE routes
       */
      .delete<DeleteWeeklyReportRequest>(
        '/v1/weeklyReport/:countryCode/:siteCode?',
        handleWith(DeleteWeeklyReportRoute),
      )
      .delete<DeleteAlertRequest>('/v1/alerts/:alertId', handleWith(DeleteAlertRoute))

      .build()
  );
}
