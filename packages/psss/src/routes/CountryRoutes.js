/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import PropTypes from 'prop-types';
import { CountryReportsViewEventBased } from '../views/CountryReportsViewEventBased';
import { CountryReportsViewWeekly } from '../views/CountryReportsViewWeekly';

export const CountryRoutes = React.memo(({ match }) => (
  <Switch>
    <Route exact path={match.path} component={CountryReportsViewWeekly} />
    <Route path={`${match.path}/event-based`} component={CountryReportsViewEventBased} />
    <Redirect to={match.path} />
  </Switch>
));

CountryRoutes.propTypes = {
  match: PropTypes.any.isRequired,
};
