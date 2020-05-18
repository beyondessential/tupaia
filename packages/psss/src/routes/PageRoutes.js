/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import { AlertReportsView } from '../views/AlertReportsView';
import { CountriesReportsView } from '../views/CountriesReportsView';
import { CountryReportsView } from '../views/CountryReportsView';

export const PageRoutes = React.memo(() => (
  <Switch>
    <Route exact path="/" component={CountriesReportsView} />
    <Route path="/weekly-reports/:countryName" component={CountryReportsView} />
    <Route path="/alerts" component={AlertReportsView} />
    <Redirect to="/" />
  </Switch>
));
