/*
 * Tupaia
 *  Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import PropTypes from 'prop-types';
import { Navigate, Route, Routes } from 'react-router-dom';
import { connect } from 'react-redux';
import { AppPageLayout, Footer } from './layout';
import { ROUTES } from './routes';
import { PROFILE_ROUTES } from './profileRoutes';
import { getHasBESAdminPanelAccess, getUser, PrivateRoute } from './authentication';
import { LoginPage } from './pages/LoginPage';
import { LogoutPage } from './pages/LogoutPage';
import { ResourcePage } from './pages/resources/ResourcePage';
import { TabPageLayout } from './layout/TabPageLayout';

export const getFlattenedChildViews = (route, basePath = '') => {
  return route.childViews.reduce((acc, childView) => {
    const { nestedView } = childView;

    const childViewWithRoute = {
      ...childView,
      basePath,
      path: `${route.path}${childView.path}`,
      to: `${basePath}${route.path}${childView.path}`, // this is an absolute route so that the breadcrumbs work
    };

    if (!nestedView) return [...acc, childViewWithRoute];

    const updatedNestedView = nestedView
      ? {
          ...nestedView,
          path: `${route.path}${childView.path}${nestedView.path}`,
          parent: childViewWithRoute,
        }
      : null;

    return [
      ...acc,
      {
        ...childViewWithRoute,
        nestedView: updatedNestedView,
      },
      updatedNestedView,
    ];
  }, []);
};

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
        childViews: route.childViews.filter(childView => userHasAccessToTab(childView)),
      };
    }).filter(route => {
      if (route.isBESAdminOnly) return !!hasBESAdminAccess;
      return route.childViews.length > 0;
    });
  };

  const accessibleRoutes = getAccessibleRoutes();
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/logout" element={<LogoutPage />} />
      <Route path="/" element={<PrivateRoute />}>
        <Route element={<AppPageLayout user={user} routes={accessibleRoutes} />}>
          <Route index element={<Navigate to="/surveys" replace />} />
          <Route path="*" element={<Navigate to="/surveys" replace />} />
          {[...accessibleRoutes, ...PROFILE_ROUTES].map(route => (
            <Route
              key={route.path}
              path={route.path}
              element={
                <TabPageLayout
                  routes={route.childViews}
                  basePath={route.path}
                  Footer={<Footer />}
                />
              }
            >
              {getFlattenedChildViews(route).map(childRoute => (
                <Route
                  key={childRoute.title}
                  path={childRoute.path}
                  element={
                    childRoute.Component ? (
                      <childRoute.Component />
                    ) : (
                      <ResourcePage {...childRoute} hasBESAdminAccess={hasBESAdminAccess} />
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
