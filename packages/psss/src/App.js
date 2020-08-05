/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { NavBar, Footer } from './components';
import { PageRoutes } from './routes/PageRoutes';
import { LoginView } from './views/LoginView';
import { PrivateRoute } from './routes/PrivateRoute';

const App = () => (
  <Router>
    <Switch>
      <Route exact path="/login">
        <LoginView />
      </Route>
      <PrivateRoute path="/">
        <NavBar />
        <PageRoutes />
        <Footer />
      </PrivateRoute>
    </Switch>
  </Router>
);

export default App;
