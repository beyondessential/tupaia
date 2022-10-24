/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { Route, Switch, BrowserRouter as Router, Redirect } from 'react-router-dom';
import { LoginView } from './views/LoginView';

export const App = () => {
  return (
    <Router>
      <Switch>
        <Route exact path="/">
          <LoginView />
        </Route>
        <Redirect to="/" />
      </Switch>
    </Router>
  );
};
