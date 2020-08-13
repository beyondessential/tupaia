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
import { checkIsAuthorisedForCountry } from '../store';

export const PageRoutes = React.memo(() => (
  <Switch>
    <PrivateRoute exact path="/">
      <CountriesReportsView />
    </PrivateRoute>
    <PrivateRoute path="/weekly-reports/:countryName" accessPolicy={checkIsAuthorisedForCountry}>
      <CountryReportsView />
    </PrivateRoute>
    <PrivateRoute path="/alerts">
      <AlertsOutbreaksView />
    </PrivateRoute>
    <Redirect to="/" />
  </Switch>
));
