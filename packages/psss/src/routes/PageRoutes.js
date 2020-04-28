/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import { AlertsView } from '../views/AlertsView';
import { WeeklyReportsView } from '../views/WeeklyReportsView';
import { WeeklyReportsCountryView } from '../views/WeeklyReportsCountryView';

export const PageRoutes = React.memo(() => (
  <Switch>
    <Route exact path="/" component={WeeklyReportsView} />
    <Route path="/weekly-reports/:countryId" component={WeeklyReportsCountryView} />
    <Route path="/alerts" component={AlertsView} />
    <Redirect to="/" />
  </Switch>
));
