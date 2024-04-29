/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import PropTypes from 'prop-types';
import { Route, Switch, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import { Footer, Main, NavPanel, PageContentWrapper, PageWrapper, SecondaryNavbar } from './layout';
import { ROUTES } from './routes';
import { PROFILE_ROUTES } from './profileRoutes';
import { getHasBESAdminPanelAccess, getUser, PrivateRoute } from './authentication';
import { LoginPage } from './pages/LoginPage';
import { LogoutPage } from './pages/LogoutPage';
import { labelToId } from './utilities';

export const App = ({ user, hasBESAdminAccess }) => {
  const userHasAccessToTab = tab => {
    if (tab.isBESAdminOnly) {
      return !!hasBESAdminAccess;
    }
    return true;
  };

  // Filter out tabs that the user does not have access to, and hide routes that have no accessible tabs
  const getAccessibleRoutes = () => {
    return ROUTES.map(route => {
      return {
        ...route,
        tabs: route.tabs.filter(tab => userHasAccessToTab(tab)),
      };
    }).filter(route => {
      if (route.isBESAdminOnly) return !!hasBESAdminAccess;
      return route.tabs.length > 0;
    });
  };

  const accessibleRoutes = getAccessibleRoutes();
  return (
    <Switch>
      <Route path="/login" exact>
        <LoginPage />
      </Route>
      <Route path="/logout" exact>
        <LogoutPage />
      </Route>
      <PrivateRoute path="/">
        <PageWrapper>
          <NavPanel
            links={accessibleRoutes.map(route => ({
              ...route,
              id: `app-tab-${labelToId(route.label)}`,
            }))}
            user={user}
            userLinks={[
              { label: 'Profile', to: '/profile' },
              { label: 'Logout', to: '/logout' },
            ]}
          />
          <Main>
            <PageContentWrapper>
              <Switch>
                {[...accessibleRoutes, ...PROFILE_ROUTES].map(route => (
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
                                <tab.component
                                  hasBESAdminAccess={hasBESAdminAccess}
                                  needsBESAdminAccess={tab.needsBESAdminAccess}
                                />
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
            </PageContentWrapper>
          </Main>
        </PageWrapper>
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

App.defaultProps = {
  hasBESAdminAccess: false,
};

App.propTypes = {
  user: PropTypes.shape({
    name: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    firstName: PropTypes.string,
    profileImage: PropTypes.string,
  }).isRequired,
  hasBESAdminAccess: PropTypes.bool,
};

export default connect(
  state => ({
    user: getUser(state),
    hasBESAdminAccess: getHasBESAdminPanelAccess(state),
  }),
  null,
)(App);
