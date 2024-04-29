/*
 * Tupaia
 *  Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
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

const PageRoute = ({ route }) => {
  const { childViews } = route;

  if (!childViews) return null;

  const params = useParams();

  const replaceParams = endpoint => {
    if (!endpoint) return null;
    let updatedEndpoint = endpoint;
    Object.keys(params).forEach(key => {
      updatedEndpoint = endpoint.replace(`{${key}}`, params[key]);
    });
    return updatedEndpoint;
  };

  // Flatten child views to include details view to create a route for each
  const flattenedChildViews = childViews.reduce((acc, childView) => {
    const { detailsView } = childView;

    const updatedDetailsView = detailsView
      ? {
          ...detailsView,
          to: `${childView.to}${detailsView.to}`,
          endpoint: replaceParams(detailsView.endpoint),
          parent: childView,
        }
      : null;

    const childViewWithRoute = {
      ...childView,
      parent: route,
      detailsView: updatedDetailsView,
    };

    if (detailsView) {
      return [...acc, childViewWithRoute, updatedDetailsView];
    }
    return [...acc, childViewWithRoute];
  }, []);

  return (
    <Routes>
      {flattenedChildViews?.map(childRoute => (
        <Route
          key={childRoute.to}
          path={childRoute.to}
          element={
            childRoute.Component ? (
              <childRoute.Component />
            ) : (
              <ResourcePage {...childRoute} endpoint={replaceParams(childRoute.endpoint)} />
            )
          }
        />
      ))}
    </Routes>
  );
};

PageRoute.propTypes = {
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
          <Route key={route.to} path={`${route.to}/*`} element={<PageRoute route={route} />} />
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
