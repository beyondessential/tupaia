/*
 * Tupaia
 *  Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import PropTypes from 'prop-types';
import { Navigate, Route, Routes, matchPath, matchRoutes } from 'react-router-dom';
import { connect } from 'react-redux';
import { PageLayout } from './layout';
import { ROUTES } from './routes';
import { PROFILE_ROUTES } from './profileRoutes';
import { PrivateRoute, getUser } from './authentication';
import { LoginPage } from './pages/LoginPage';
import { LogoutPage } from './pages/LogoutPage';
import { ResourcePage } from './pages/resources/ResourcePage';

export const TabRoutes = ({ route, baseUrl }) => {
  const { childViews } = route;

  if (!childViews) return null;

  const flattenedChildViews = childViews.reduce((acc, childView) => {
    const { detailsView } = childView;

    const childViewWithRoute = {
      ...childView,
      url: `${baseUrl}${route.url}${childView.url}`,
      path: `${baseUrl}${route.url}${childView.url}`,
      parent: route,
    };

    if (!detailsView) return [...acc, childViewWithRoute];

    const detailsParent = {
      ...childView,
      to: `${route.url}${childView.url}`,
      parent: route,
    };

    const updatedDetailsView = detailsView
      ? {
          ...detailsView,
          to: `${route.url}${childView.url}${detailsView.url}`,
          url: `${childViewWithRoute.url}${detailsView.url}`,
          parent: detailsParent,
        }
      : null;

    return [
      ...acc,
      {
        ...childViewWithRoute,
        detailsView: updatedDetailsView,
      },
      updatedDetailsView,
    ];
  }, []);

  return (
    <Routes>
      {flattenedChildViews?.map(childRoute => (
        <Route
          key={childRoute.title}
          path={childRoute.url}
          element={
            childRoute.Component ? <childRoute.Component /> : <ResourcePage {...childRoute} />
          }
        />
      ))}
      {/* <Route path="*" element={<Navigate to={flattenedChildViews[0].url} replace />} /> */}
    </Routes>
  );
};

TabRoutes.propTypes = {
  route: PropTypes.object.isRequired,
  baseUrl: PropTypes.string,
};

TabRoutes.defaultProps = {
  baseUrl: '',
};

export const App = ({ user }) => {
  return (
    <Routes>
      <Route path="/login" exact element={<LoginPage />} />
      <Route path="/logout" exact element={<LogoutPage />} />
      <Route path="/" element={<PrivateRoute />}>
        <Route element={<PageLayout user={user} routes={ROUTES} />}>
          <Route index element={<Navigate to="/surveys" replace />} />
          <Route path="*" element={<Navigate to="/surveys" replace />} />
          {[...ROUTES, ...PROFILE_ROUTES].map(route => (
            <Route key={route.url} path={`${route.url}/*`} element={<TabRoutes route={route} />} />
          ))}
        </Route>
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
