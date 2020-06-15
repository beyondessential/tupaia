/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { Redirect, Route, Switch, useRouteMatch } from 'react-router-dom';
import { AlertsTabView } from '../views/AlertsTabView';
import { ArchiveTabView } from '../views/ArchiveTabView';
import { OutbreaksTabView } from '../views/OutbreaksTabView';

export const AlertsRoutes = React.memo(() => {
  const match = useRouteMatch();

  return (
    <Switch>
      <Route exact path={match.path}>
        <AlertsTabView />
      </Route>
      <Route path={`${match.path}/outbreaks`}>
        <OutbreaksTabView />
      </Route>
      <Route path={`${match.path}/archive`}>
        <ArchiveTabView />
      </Route>
      <Redirect to={match.path} />
    </Switch>
  );
});
