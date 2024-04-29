/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import PropTypes from 'prop-types';
import { Navigate, Route, Routes, useParams } from 'react-router-dom';
import { connect } from 'react-redux';
import { PageLayout } from './layout';
import { ROUTES } from './routes';
import { PROFILE_ROUTES } from './profileRoutes';
import { getUser } from './authentication';
import { LoginPage } from './pages/LoginPage';
import { LogoutPage } from './pages/LogoutPage';
import { ResourcePage } from './pages/resources/ResourcePage';

const RecursiveChildRoute = ({ route, ...props }) => {
  const { childViews } = route;

  if (!childViews) return null;

  return (
    <Routes>
      {childViews?.map(childRoute => (
        <Route
          key={childRoute.to}
          path={childRoute.to}
          element={
            childRoute.Component ? (
              <childRoute.Component />
            ) : (
              <ResourcePage
                {...props}
                {...childRoute}
                endpoint={childRoute.endpoint?.replace('{id}', useParams().id)}
              />
            )
          }
        />
      ))}
    </Routes>
  );
};

RecursiveChildRoute.propTypes = {
  route: PropTypes.object.isRequired,
};

export const App = ({ user }) => {
  return (
    <Routes>
      <Route path="/login" exact element={<LoginPage />} />
      <Route path="/logout" exact element={<LogoutPage />} />
      <Route path="/" element={<PageLayout user={user} />}>
        <Route index element={<Navigate to="/surveys" replace />} />
        {[...ROUTES, ...PROFILE_ROUTES].map(route => (
          <Route
            key={route.to}
            path={`${route.to}/*`}
            element={<RecursiveChildRoute route={route} />}
          />
        ))}
      </Route>
    </Routes>
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
