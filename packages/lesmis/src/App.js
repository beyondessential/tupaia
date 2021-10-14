/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { Route, Switch, BrowserRouter as Router, Redirect } from 'react-router-dom';
import { PageRoutes } from './routes/PageRoutes';
import { DEFAULT_LOCALE, LOCALES } from './constants';

const loadLocale = () => {
  // eslint-disable-next-line no-undef
  const { pathname } = window.location;

  // Load the locale from the url if it is set
  const urlLocale = pathname.split('/')[1];

  if (LOCALES.includes(urlLocale)) {
    // eslint-disable-next-line no-undef
    window.localStorage.setItem('lesmis-locale', urlLocale);
    return urlLocale;
  }

  // eslint-disable-next-line no-undef
  return window.localStorage.getItem('lesmis-locale') || DEFAULT_LOCALE;
};

export const App = () => {
  const locale = loadLocale();

  return (
    <Router>
      <Switch>
        <Route path="/:locale(en|lo)">
          <PageRoutes />
        </Route>
        <Redirect to={`/${locale}`} />
      </Switch>
    </Router>
  );
};
