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
    new OrchestratorApiBuilder(db, 'psss')
      .useSessionModel(PsssSessionModel)
      .verifyLogin(hasPSSSAccess)

      /**
       * GET routes
       */
      .get<FetchAlertsRequest>('alerts/:category', handleWith(FetchAlertsRoute))
      .get<FetchConfirmedWeeklyReportRequest>(
        'confirmedWeeklyReport/:countryCode?',
        handleWith(FetchConfirmedWeeklyReportRoute),
      )
      .get<FetchCountriesRequest>('country', handleWith(FetchCountries))
      .get<FetchCountrySitesRequest>('country/:countryCode/sites', handleWith(FetchCountrySites))
      .get<FetchWeeklyReportRequest>(
        'weeklyReport/:countryCode',
        handleWith(FetchWeeklyReportRoute),
      )
      .get<FetchWeeklyReportRequest>(
        'weeklyReport/:countryCode/:sites?',
        handleWith(FetchWeeklyReportRoute),
      )

      /**
       * POST routes
       */
      .post<ConfirmWeeklyReportRequest>(
        'confirmedWeeklyReport/:countryCode',
        handleWith(ConfirmWeeklyReportRoute),
      )

      /**
       * PUT routes
       */
      .put<SaveWeeklyReportRequest>(
        'weeklyReport/:countryCode/:siteCode?',
        handleWith(SaveWeeklyReportRoute),
      )
      .put<ProcessAlertActionRequest>(
        'alerts/:alertId/:action',
        handleWith(ProcessAlertActionRoute),
      )

      /**
       * DELETE routes
       */
      .delete<DeleteWeeklyReportRequest>(
        'weeklyReport/:countryCode/:siteCode?',
        handleWith(DeleteWeeklyReportRoute),
      )
      .delete<DeleteAlertRequest>('alerts/:alertId', handleWith(DeleteAlertRoute))

      .build()
  );
}
