/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { Redirect, Route, Switch, useRouteMatch } from 'react-router-dom';
import { AlertsTabView } from '../views/Tabs/AlertsTabView';
import { OutbreaksTabView } from '../views/Tabs/OutbreaksTabView';

export const AlertsRoutes = React.memo(() => {
  const match = useRouteMatch();

  return (
    <Switch>
      <Route exact path={match.path}>
        <AlertsTabView alertStatus="active" />
      </Route>
      <Route exact path={`${match.path}/outbreaks`}>
        <OutbreaksTabView />
      </Route>
      <Route exact path={`${match.path}/archive`}>
        <AlertsTabView alertStatus="archived" />
      </Route>
      <Redirect to={match.path} />
    </Switch>
  );
});
