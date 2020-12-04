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
import { getEntitiesAllowed, checkIsMultiCountryUser } from '../store';

export const PageRoutesComponent = React.memo(({ canViewMultipleCountries, canViewCountry }) => {
  console.log('re-render app...');
  return (
    <Switch>
      <PrivateRoute exact path="/" authCheck={canViewMultipleCountries}>
        <CountriesReportsView />
      </PrivateRoute>
      <Route path="/profile">
        <ProfileView />
      </Route>
      <PrivateRoute path="/weekly-reports/:countryCode" authCheck={canViewCountry}>
        <CountryReportsView />
      </PrivateRoute>
      {canViewMultipleCountries() ? (
        <PrivateRoute path="/alerts" authCheck={canViewMultipleCountries}>
          <AlertsOutbreaksView />
        </PrivateRoute>
      ) : (
        <PrivateRoute path="/alerts/:countryCode" authCheck={canViewCountry}>
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
  );
});

PageRoutesComponent.propTypes = {
  canViewMultipleCountries: PropTypes.func.isRequired,
  canViewCountry: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  canViewMultipleCountries: () => checkIsMultiCountryUser(state),
  canViewCountry: match =>
    getEntitiesAllowed(state).some(
      entityCode => entityCode.toLowerCase() === match.params.countryCode,
    ),
});

export const PageRoutes = connect(mapStateToProps)(PageRoutesComponent);
