/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { Route, Switch, BrowserRouter as Router, Redirect } from 'react-router-dom';
import { PageRoutes } from './routes/PageRoutes';

export const App = () => (
  <Router>
    <Switch>
      <Route path="/:lang(en|la)">
        <PageRoutes />
      </Route>
      <Redirect to="/en" />
    </Switch>
  </Router>
);
