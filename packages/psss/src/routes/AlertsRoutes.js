/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import PropTypes from 'prop-types';
import { TableView } from '../views/TableView';

const routedTableView = endpoint =>
  React.memo(props => (
    <TableView {...props} config={{ resource: `base-url/resources/${endpoint}` }} />
  ));

const AlertsView = routedTableView('alerts');
const OutbreaksView = routedTableView('outbreaks');
const ArchiveView = routedTableView('archive');

export const AlertsRoutes = React.memo(({ match }) => (
  <Switch>
    <Route exact path={match.path} component={AlertsView} />
    <Route path={`${match.path}/outbreaks`} component={OutbreaksView} />
    <Route path={`${match.path}/archive`} component={ArchiveView} />
    <Redirect to={match.path} />
  </Switch>
));

AlertsRoutes.propTypes = {
  match: PropTypes.any.isRequired,
};
