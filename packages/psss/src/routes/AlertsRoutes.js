/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import PropTypes from 'prop-types';
import { TableView } from '../views/TableView';

const alertsConfig = {
  resource: 'base-url/resources/alerts',
};

const outbreaksConfig = {
  resource: 'base-url/resources/outbreaks',
};

const archiveConfig = {
  resource: 'base-url/resources/archive',
};

export const AlertsRoutes = React.memo(({ match }) => (
  <Switch>
    <Route
      exact
      path={match.path}
      render={props => <TableView {...props} config={alertsConfig} />}
    />
    <Route
      path={`${match.path}/outbreaks`}
      render={props => <TableView {...props} config={outbreaksConfig} />}
    />
    <Route
      path={`${match.path}/archive`}
      render={props => <TableView {...props} config={archiveConfig} />}
    />
    <Redirect to={match.path} />
  </Switch>
));

AlertsRoutes.propTypes = {
  match: PropTypes.any.isRequired,
};
