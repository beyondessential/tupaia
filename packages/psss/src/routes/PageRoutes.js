/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { Redirect, Switch } from 'react-router-dom';
import { AlertsOutbreaksView } from '../views/AlertsOutbreaksView';
import { CountriesReportsView } from '../views/CountriesReportsView';
import { CountryReportsView } from '../views/CountryReportsView';
import { PrivateRoute } from './PrivateRoute';
import { UnAuthorisedView } from '../views/UnauthorisedView';
import { checkIsAuthorisedForCountry, checkIsAuthorisedForMultiCountry } from '../utils/auth';

export const PageRoutes = React.memo(() => (
  <Switch>
    <PrivateRoute exact path="/" authCheck={checkIsAuthorisedForMultiCountry}>
      <CountriesReportsView />
    </PrivateRoute>
    <PrivateRoute path="/weekly-reports/:countryName" authCheck={checkIsAuthorisedForCountry}>
      <CountryReportsView />
    </PrivateRoute>
    <PrivateRoute path="/alerts">
      <AlertsOutbreaksView />
    </PrivateRoute>
    <PrivateRoute path="/unauthorised">
      <UnAuthorisedView />
    </PrivateRoute>
    <Redirect to="/" />
  </Switch>
));
