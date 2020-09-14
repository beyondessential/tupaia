/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { Switch, Route } from 'react-router-dom';
import { AlertsOutbreaksView } from '../views/AlertsOutbreaksView';
import { AlertsOutbreaksSummaryView } from '../views/AlertsOutbreaksSummaryView';
import { CountriesReportsView } from '../views/CountriesReportsView';
import { CountryReportsView } from '../views/CountryReportsView';
import { PrivateRoute } from './PrivateRoute';
import { UnAuthorisedView } from '../views/UnauthorisedView';
import { NotFoundView } from '../views/NotFoundView';
import { checkIsAuthorisedForCountry, checkIsAuthorisedForMultiCountry } from '../utils/auth';

export const PageRoutes = React.memo(() => (
  <Switch>
    <PrivateRoute exact path="/" authCheck={checkIsAuthorisedForMultiCountry}>
      <CountriesReportsView />
    </PrivateRoute>
    <PrivateRoute path="/weekly-reports/:countryCode" authCheck={checkIsAuthorisedForCountry}>
      <CountryReportsView />
    </PrivateRoute>
    <PrivateRoute path="/alerts/:countryCode" authCheck={checkIsAuthorisedForCountry}>
      <AlertsOutbreaksSummaryView />
    </PrivateRoute>
    <PrivateRoute path="/alerts" authCheck={checkIsAuthorisedForMultiCountry}>
      <AlertsOutbreaksView />
    </PrivateRoute>
    <PrivateRoute path="/unauthorised">
      <UnAuthorisedView />
    </PrivateRoute>
    <Route>
      <NotFoundView />
    </Route>
  </Switch>
));
