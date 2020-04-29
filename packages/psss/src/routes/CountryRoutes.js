/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import PropTypes from 'prop-types';
import { EventBasedCountryView } from '../views/EventsBasedCountryView';
import { WeeklyReportsCountryView } from '../views/WeeklyReportsCountryView';

export const CountryRoutes = React.memo(({ match }) => (
  <Switch>
    <Route exact path={match.path} component={WeeklyReportsCountryView} />
    <Route path={`${match.path}/event-based`} component={EventBasedCountryView} />
    <Redirect to={match.path} />
  </Switch>
));

CountryRoutes.propTypes = {
  match: PropTypes.any.isRequired,
};
