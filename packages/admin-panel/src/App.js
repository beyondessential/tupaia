/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import { TabsToolbar } from '@tupaia/ui-components';
import { Navbar, Footer } from './widgets';
import { ROUTES } from './routes';
import { PROFILE_ROUTES } from './profileRoutes';
import { PrivateRoute } from './authentication';
import { LoginPage } from './pages/LoginPage';

export const App = () => {
  const headerEl = React.useRef(null);

  const getHeaderEl = () => {
    return headerEl;
  };

  return (
    <Router>
      <Switch>
        <Route path="/login" exact>
          <LoginPage />
        </Route>
        <PrivateRoute path="/">
          <Navbar links={ROUTES} />
          <div ref={headerEl} />
          <Switch>
            {[...ROUTES, ...PROFILE_ROUTES].map(route => (
              <Route key={route.to} path={route.to}>
                <TabsToolbar links={route.tabs} />
                <Switch>
                  {route.tabs.map(tab => (
                    <Route key={`${route.to}-${tab.to}`} path={`${route.to}${tab.to}`} exact>
                      <tab.component getHeaderEl={getHeaderEl} />
                    </Route>
                  ))}
                  <Redirect to={route.to} />
                </Switch>
              </Route>
            ))}
            <Redirect to="surveys" />
          </Switch>
        </PrivateRoute>
        <Redirect to="/login" />
      </Switch>
      <Footer />
    </Router>
  );
};
