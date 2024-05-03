/*
 * Tupaia
 *  Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import PropTypes from 'prop-types';
import { Navigate, Route, Routes } from 'react-router-dom';
import { connect } from 'react-redux';
import { AppPageLayout } from './layout';
import { ROUTES } from './routes';
import { PROFILE_ROUTES } from './profileRoutes';
import { PrivateRoute, getUser } from './authentication';
import { LoginPage } from './pages/LoginPage';
import { LogoutPage } from './pages/LogoutPage';
import { ResourcePage } from './pages/resources/ResourcePage';
import { TabPageLayout } from './layout/TabPageLayout';

export const getFlattenedChildViews = route => {
  return route.childViews.reduce((acc, childView) => {
    const { detailsView } = childView;

    const childViewWithRoute = {
      ...childView,
      path: `${route.path}${childView.path}`,
      parent: route,
    };

    if (!detailsView) return [...acc, childViewWithRoute];

    const updatedDetailsView = detailsView
      ? {
          ...detailsView,
          path: `${route.path}${childView.path}${detailsView.path}`,
          parent: childViewWithRoute,
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
};

export const App = ({ user }) => {
  return (
    <Routes>
      <Route path="/login" exact element={<LoginPage />} />
      <Route path="/logout" exact element={<LogoutPage />} />
      <Route path="/" element={<PrivateRoute />}>
        <Route element={<AppPageLayout user={user} />}>
          <Route index element={<Navigate to="/surveys" replace />} />
          <Route path="*" element={<Navigate to="/surveys" replace />} />
          {[...ROUTES, ...PROFILE_ROUTES].map(route => (
            <Route
              key={route.path}
              path={route.path}
              element={<TabPageLayout routes={route.childViews} baseUrl={route.path} />}
            >
              {/* <Route index element={<Navigate to={route.childViews[0].path} replace />} /> */}
              {getFlattenedChildViews(route).map(childRoute => (
                <Route
                  key={childRoute.title}
                  path={childRoute.path}
                  element={
                    childRoute.Component ? (
                      <childRoute.Component />
                    ) : (
                      <ResourcePage {...childRoute} />
                    )
                  }
                />
              ))}
              <Route path="*" element={<Navigate to={route.childViews[0].path} replace />} />
            </Route>
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
