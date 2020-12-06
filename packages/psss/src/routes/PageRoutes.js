/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Switch, Route } from 'react-router-dom';
import { AlertsOutbreaksView } from '../views/AlertsOutbreaksView';
import { CountriesReportsView } from '../views/CountriesReportsView';
import { CountryReportsView } from '../views/CountryReportsView';
import { PrivateRoute } from './PrivateRoute';
import { UnauthorisedView } from '../views/UnauthorisedView';
import { ProfileView } from '../views/ProfileView';
import { NotFoundView } from '../views/NotFoundView';
import { canUserViewMultipleCountries, getCurrentUser, canUserViewCountry } from '../store';

export const PageRoutesComponent = React.memo(({ user }) => (
  <Switch>
    <PrivateRoute exact path="/" authCheck={match => canUserViewMultipleCountries(user, match)}>
      <CountriesReportsView />
    </PrivateRoute>
    <Route path="/profile">
      <ProfileView />
    </Route>
    <PrivateRoute
      path="/weekly-reports/:countryCode"
      authCheck={match => canUserViewCountry(user, match)}
    >
      <CountryReportsView />
    </PrivateRoute>
    {canUserViewMultipleCountries(user) ? (
      <PrivateRoute path="/alerts">
        <AlertsOutbreaksView />
      </PrivateRoute>
    ) : (
      <PrivateRoute
        path="/alerts/:countryCode"
        authCheck={match => canUserViewCountry(user, match)}
      >
        <AlertsOutbreaksView />
      </PrivateRoute>
    )}
    <Route path="/unauthorised">
      <UnauthorisedView />
    </Route>
    <Route>
      <NotFoundView />
    </Route>
  </Switch>
));

PageRoutesComponent.propTypes = {
  user: PropTypes.object.isRequired,
};

const mapStateToProps = state => ({
  user: getCurrentUser(state),
});

export const PageRoutes = connect(mapStateToProps)(PageRoutesComponent);
