/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import PropTypes from 'prop-types';
import { Route, Switch, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import { TabsToolbar } from '@tupaia/ui-components';
import { Navbar, Footer } from './widgets';
import { ROUTES } from './routes';
import { PROFILE_ROUTES } from './profileRoutes';
import { getUser, getIsBESAdmin, PrivateRoute } from './authentication';
import { LoginPage } from './pages/LoginPage';
import { LogoutPage } from './pages/LogoutPage';

export const App = ({ user, isBESAdmin }) => {
  const headerEl = React.useRef(null);

  const getHeaderEl = () => {
    return headerEl;
  };

  return (
    <Switch>
      <Route path="/login" exact>
        <LoginPage />
      </Route>
      <Route path="/logout" exact>
        <LogoutPage />
      </Route>
      <PrivateRoute path="/">
        <Navbar links={ROUTES} user={user} />
        <div ref={headerEl} />
        <Switch>
          {[...ROUTES, ...PROFILE_ROUTES].map(route => (
            <Route key={route.to} path={route.to}>
              <TabsToolbar links={route.tabs} maxWidth="xl" />
              <Switch>
                {route.tabs.map(tab => (
                  <Route key={`${route.to}-${tab.to}`} path={`${route.to}${tab.to}`} exact>
                    <tab.component getHeaderEl={getHeaderEl} isBESAdmin={isBESAdmin} />
                  </Route>
                ))}
                <Redirect to={route.to} />
              </Switch>
            </Route>
          ))}
          <Redirect to="surveys" />
        </Switch>
        <Footer />
      </PrivateRoute>
      <Redirect to="/login" />
    </Switch>
  );
};

App.propTypes = {
  user: PropTypes.shape({
    name: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    firstName: PropTypes.string,
    profileImage: PropTypes.string,
  }).isRequired,
  isBESAdmin: PropTypes.bool,
};

App.defaultProps = {
  isBESAdmin: false,
};

export default connect(
  state => ({
    user: getUser(state),
    isBESAdmin: getIsBESAdmin(state),
  }),
  null,
)(App);
