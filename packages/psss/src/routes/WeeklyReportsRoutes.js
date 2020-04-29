/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import PropTypes from 'prop-types';
import { TableView } from '../views/TableView';

const weeklyReportConfig = {
  resource: 'base-url/resources/weekly-reports',
};

const eventBasedConfig = {
  resource: 'base-url/resources/event-based',
};

export const WeeklyReportsRoutes = React.memo(({ match }) => (
  <Switch>
    <Route
      exact
      path={match.path}
      render={props => <TableView {...props} config={weeklyReportConfig} />}
    />
    <Route
      path={`${match.path}/event-based`}
      render={props => <TableView {...props} config={eventBasedConfig} />}
    />
    <Redirect to={match.path} />
  </Switch>
));

WeeklyReportsRoutes.propTypes = {
  match: PropTypes.any.isRequired,
};
