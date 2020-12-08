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
import { getEntitiesAllowed, canUserViewMultipleCountries, canUserViewCountry } from '../store';

export const PageRoutesComponent = React.memo(({ allowedEntities }) => (
  <Switch>
    <PrivateRoute
      exact
      path="/"
      authCheck={() => canUserViewMultipleCountries(allowedEntities)}
      redirectTo={`/weekly-reports/${allowedEntities[0]}`}
    >
      <CountriesReportsView />
    </PrivateRoute>
    <Route path="/profile">
      <ProfileView />
    </Route>
    <PrivateRoute
      path="/weekly-reports/:countryCode"
      authCheck={match => canUserViewCountry(allowedEntities, match)}
    >
      <CountryReportsView />
    </PrivateRoute>
    {canUserViewMultipleCountries(allowedEntities) ? (
      <PrivateRoute path="/alerts">
        <AlertsOutbreaksView />
      </PrivateRoute>
    ) : (
      <PrivateRoute
        path="/alerts/:countryCode"
        authCheck={match => canUserViewCountry(allowedEntities, match)}
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
  allowedEntities: PropTypes.object.isRequired,
};

const mapStateToProps = state => ({
  allowedEntities: getEntitiesAllowed(state),
});

export const PageRoutes = connect(mapStateToProps)(PageRoutesComponent);
