/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import { AlertsView } from '../views/AlertsView';
import { WeeklyReportsView } from '../views/WeeklyReportsView';
import { CountryView } from '../views/CountryView';

export const PageRoutes = React.memo(() => (
  <Switch>
    <Route exact path="/" component={WeeklyReportsView} />
    <Route path="/weekly-reports/:countryName" component={CountryView} />
    <Route path="/alerts" component={AlertsView} />
    <Redirect to="/" />
  </Switch>
));
