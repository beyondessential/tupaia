/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import { LightOutlinedButton, TabsToolbar } from '@tupaia/ui-components';
import { Navbar, Footer } from './widgets';
import { ROUTES } from './routes';
import { Header, HeaderButtons, Title } from './pages/Page';

export const App = () => (
  <Router>
    <Switch>
      {ROUTES.map(route => (
        <Route key={route.to} path={route.to}>
          <Navbar links={ROUTES} />
          <Header>
            <Title>{route.label}</Title>
            <HeaderButtons>
              <LightOutlinedButton>Export</LightOutlinedButton>
            </HeaderButtons>
          </Header>
          <TabsToolbar links={route.tabs} />
          <Switch>
            {route.tabs.map(tab => (
              <Route key={`${route.to}-${tab.to}`} path={`${route.to}${tab.to}`} exact>
                {tab.component}
              </Route>
            ))}
            <Redirect to={route.to} />
          </Switch>
        </Route>
      ))}
      <Redirect to="/surveys" />
    </Switch>
    <Footer />
  </Router>
);
