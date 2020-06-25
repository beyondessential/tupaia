/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { Redirect, Switch, Route } from 'react-router-dom';
import { AlertsOutbreaksView } from '../views/AlertsOutbreaksView';
import { CountriesReportsView } from '../views/CountriesReportsView';
import { CountryReportsView } from '../views/CountryReportsView';
import { Sandbox } from '../views/Sandbox';
import { PrivateRoute } from './PrivateRoute';

export const PageRoutes = React.memo(() => (
  <Switch>
    <Route path="/sandbox">
      <Sandbox />
    </Route>
    <PrivateRoute exact path="/">
      <CountriesReportsView />
    </PrivateRoute>
    <PrivateRoute path="/weekly-reports/:countryName">
      <CountryReportsView />
    </PrivateRoute>
    <PrivateRoute path="/alerts">
      <AlertsOutbreaksView />
    </PrivateRoute>
    <Redirect to="/" />
  </Switch>
));
