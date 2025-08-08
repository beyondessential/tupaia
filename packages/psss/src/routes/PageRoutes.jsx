import React from 'react';
import { useSelector } from 'react-redux';
import { Switch, Route } from 'react-router-dom';
import { CountriesReportsView } from '../views/CountriesReportsView';
import { CountryReportsView } from '../views/CountryReportsView';
import { PrivateRoute } from './PrivateRoute';
import { UnauthorisedView } from '../views/UnauthorisedView';
import { ProfileView } from '../views/ProfileView';
import { NotFoundView } from '../views/NotFoundView';
import { canUserViewMultipleCountries, canUserViewCountry, getCountryCodes } from '../store';
import { AlertsOutbreaksView } from '../views/AlertsOutbreaksView';

export const PageRoutes = React.memo(() => {
  const countryCodes = useSelector(state => getCountryCodes(state));
  const checkCountries = () => canUserViewMultipleCountries(countryCodes);
  const checkCountry = match => canUserViewCountry(countryCodes, match);

  return (
    <Switch>
      <PrivateRoute
        exact
        path="/"
        authCheck={checkCountries}
        redirectTo={`/weekly-reports/${countryCodes[0]}`}
      >
        <CountriesReportsView />
      </PrivateRoute>
      <Route path="/profile">
        <ProfileView />
      </Route>
      <PrivateRoute path="/weekly-reports/:countryCode" authCheck={checkCountry}>
        <CountryReportsView />
      </PrivateRoute>
      <PrivateRoute path="/alerts">
        <AlertsOutbreaksView />
      </PrivateRoute>
      <Route path="/unauthorised">
        <UnauthorisedView />
      </Route>
      <Route>
        <NotFoundView />
      </Route>
    </Switch>
  );
});
