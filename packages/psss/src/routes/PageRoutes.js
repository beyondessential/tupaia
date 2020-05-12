/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { Redirect, Switch } from 'react-router-dom';
import { AlertReportsView } from '../views/AlertReportsView';
import { WeeklyReportsView } from '../views/CountriesReportsView';
import { CountryReportsView } from '../views/CountryReportsView';
import { PrivateRoute } from './PrivateRoute';

export const PageRoutes = React.memo(() => (
  <Switch>
    <PrivateRoute exact path="/">
      <WeeklyReportsView />
    </PrivateRoute>
    <PrivateRoute path="/weekly-reports/:countryName">
      <CountryReportsView />
    </PrivateRoute>
    <PrivateRoute path="/alerts">
      <AlertReportsView />
    </PrivateRoute>
    <Redirect to="/" />
  </Switch>
));
