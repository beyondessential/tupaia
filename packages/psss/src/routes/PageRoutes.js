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
import { checkIsAuthorisedForCountry, checkIsAuthorisedForMultiCountry } from '../utils/auth';
import { checkIsMultiCountryUser } from '../store';

export const PageRoutesComponent = React.memo(({ canViewMultipleCountries }) => (
  <Switch>
    <PrivateRoute exact path="/" authCheck={checkIsAuthorisedForMultiCountry}>
      <CountriesReportsView />
    </PrivateRoute>
    <Route path="/profile">
      <ProfileView />
    </Route>
    <PrivateRoute path="/weekly-reports/:countryCode" authCheck={checkIsAuthorisedForCountry}>
      <CountryReportsView />
    </PrivateRoute>
    {canViewMultipleCountries ? (
      <PrivateRoute path="/alerts" authCheck={checkIsAuthorisedForMultiCountry}>
        <AlertsOutbreaksView />
      </PrivateRoute>
    ) : (
      <PrivateRoute path="/alerts/:countryCode" authCheck={checkIsAuthorisedForCountry}>
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
  canViewMultipleCountries: PropTypes.bool,
};

PageRoutesComponent.defaultProps = {
  canViewMultipleCountries: false,
};

const mapStateToProps = state => ({
  canViewMultipleCountries: checkIsMultiCountryUser(state),
});

export const PageRoutes = connect(mapStateToProps)(PageRoutesComponent);
