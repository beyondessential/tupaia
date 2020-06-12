/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { Redirect, Route, Switch, useRouteMatch } from 'react-router-dom';
import { TableView } from '../views/TableView';
import { AlertsTabView } from '../views/AlertsTabView';

const routedTableView = endpoint =>
  React.memo(props => (
    <TableView {...props} config={{ resource: `base-url/resources/${endpoint}` }} />
  ));

const OutbreaksView = routedTableView('outbreaks');
const ArchiveView = routedTableView('archive');

export const AlertsRoutes = React.memo(() => {
  const match = useRouteMatch();

  return (
    <Switch>
      <Route exact path={match.path}>
        <AlertsTabView />
      </Route>
      <Route path={`${match.path}/outbreaks`}>
        <OutbreaksView />
      </Route>
      <Route path={`${match.path}/archive`}>
        <ArchiveView />
      </Route>
      <Redirect to={match.path} />
    </Switch>
  );
});
