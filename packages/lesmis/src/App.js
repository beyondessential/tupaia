/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { NavBar, Footer } from './components';
import { LoginView } from './views/LoginView';
import { PrivateRoute } from './routes/PrivateRoute';
import { PageRoutes } from './routes/PageRoutes';

export const Container = styled.main`
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  padding-top: 5%;
  text-align: center;
`;

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
