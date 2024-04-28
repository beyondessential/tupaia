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
import { getUser, PrivateRoute } from './authentication';
import { LoginPage } from './pages/LoginPage';
import { LogoutPage } from './pages/LogoutPage';
import { labelToId } from './utilities';
import { ResourcePage } from './pages/resources/ResourcePage';

const RecursiveChildRoute = ({ route, getHeaderEl, basePath }) => {
  return (
    <Switch>
      {route.childViews?.map(child => {
        return (
          <Route
            key={`${basePath}-${child.to}`}
            path={`${basePath}${child.to}`}
            render={({ match, ...rest }) => {
              console.log(rest, match);
              return (
                <>
                  {/** Only render the component when the match is exact, i.e. not when it should be the child component rendered */}
                  {match.isExact &&
                    (child.Component ? ( // If the child has a component, render it
                      <child.Component getHeaderEl={getHeaderEl} />
                    ) : (
                      // Otherwise, render the ResourcePage
                      <ResourcePage
                        getHeaderEl={getHeaderEl}
                        {...match.params}
                        {...child}
                        endpoint={child.endpoint?.replace('{id}', match.params.id)}
                      />
                    ))}
                  {child.childViews && (
                    <RecursiveChildRoute
                      route={child}
                      getHeaderEl={getHeaderEl}
                      basePath={`${basePath}${child.to}`}
                    />
                  )}
                </>
              );
            }}
          />
        );
      })}
      <Redirect to={basePath} />
    </Switch>
  );
};

RecursiveChildRoute.propTypes = {
  route: PropTypes.object.isRequired,
  getHeaderEl: PropTypes.func.isRequired,
  basePath: PropTypes.string.isRequired,
};

export const App = ({ user }) => {
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
        <Navbar
          links={ROUTES.map(route => ({ ...route, id: `app-tab-${labelToId(route.label)}` }))}
          user={user}
        />
        <div ref={headerEl} />
        <Switch>
          {[...ROUTES, ...PROFILE_ROUTES].map(route => (
            <Route
              key={route.to}
              path={route.to}
              render={({ match }) => {
                return (
                  <>
                    <TabsToolbar
                      links={route.childViews.map(tab => ({
                        ...tab,
                        id: `app-subTab-${labelToId(tab.label)}`,
                      }))}
                      maxWidth="xl"
                      baseRoute={match.url}
                    />
                    <RecursiveChildRoute
                      route={route}
                      getHeaderEl={getHeaderEl}
                      basePath={route.to}
                    />
                  </>
                );
              }}
            />
          ))}
          <Redirect to="surveys" />
        </Switch>
        <Footer />
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
