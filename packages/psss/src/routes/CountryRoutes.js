/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { useRouteMatch, Redirect, Route, Switch } from 'react-router-dom';
import { CountryReportsViewEventBased } from '../views/CountryReportsViewEventBased';
import { CountryReportsViewWeekly } from '../views/CountryReportsViewWeekly';

export const CountryRoutes = React.memo(() => {
  const match = useRouteMatch();
  return (
    <Switch>
      <Route exact path={match.path}>
        <CountryReportsViewWeekly />
      </Route>
      <Route path={`${match.path}/event-based`}>
        <CountryReportsViewEventBased />
      </Route>
      <Redirect to={match.path} />
    </Switch>
  );
});
