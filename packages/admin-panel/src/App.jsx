/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import PropTypes from 'prop-types';
import { Route, Switch, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { NavPanel, Footer, SecondaryNavbar } from './widgets';
import { ROUTES } from './routes';
import { PROFILE_ROUTES } from './profileRoutes';
import { getUser, PrivateRoute } from './authentication';
import { LoginPage } from './pages/LoginPage';
import { LogoutPage } from './pages/LogoutPage';
import { labelToId } from './utilities';

const Wrapper = styled.div`
  display: grid;
  grid-template-columns: minmax(15rem, 22rem) 1fr;
`;

const Main = styled.main`
  width: 100%;
  overflow-y: auto;
  overflow-x: hidden;
`;

export const App = ({ user }) => {
  return (
    <Switch>
      <Route path="/login" exact>
        <LoginPage />
      </Route>
      <Route path="/logout" exact>
        <LogoutPage />
      </Route>
      <PrivateRoute path="/">
        <Wrapper>
          <NavPanel
            links={ROUTES.map(route => ({ ...route, id: `app-tab-${labelToId(route.label)}` }))}
            user={user}
          />
          <Main>
            <Switch>
              {[...ROUTES, ...PROFILE_ROUTES].map(route => (
                <Route
                  key={route.to}
                  path={route.to}
                  render={({ match }) => {
                    return (
                      <>
                        <SecondaryNavbar
                          links={route.tabs.map(tab => ({
                            ...tab,
                            id: `app-subTab-${labelToId(tab.label)}`,
                          }))}
                          baseRoute={match.url}
                        />
                        <Switch>
                          {route.tabs.map(tab => (
                            <Route
                              key={`${route.to}-${tab.to}`}
                              path={`${route.to}${tab.to}`}
                              exact
                            >
                              <tab.component />
                            </Route>
                          ))}
                          <Redirect to={route.to} />
                        </Switch>
                      </>
                    );
                  }}
                />
              ))}
              <Redirect to="surveys" />
            </Switch>
            <Footer />
          </Main>
        </Wrapper>
      </PrivateRoute>
      <Redirect
        to={{
          pathname: '/login',
          state: { from: window.location.pathname },
        }}
      />
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
};

export default connect(
  state => ({
    user: getUser(state),
  }),
  null,
)(App);
