import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AppPageLayout, AuthLayout, Footer } from './layout';
import { AUTH_ROUTES, ROUTES } from './routes';
import { PROFILE_ROUTES } from './profileRoutes';
import { PrivateRoute } from './authentication';
import { LoginPage } from './pages/LoginPage';
import { ResourcePage } from './pages/resources/ResourcePage';
import { TabPageLayout } from './layout/TabPageLayout';
import { useUser } from './api/queries';
import { getHasBESAdminAccess } from './utilities';
import { ForgotPasswordPage, ResetPasswordPage } from './pages';

export const getFlattenedChildViews = (route, basePath = '') => {
  return route.childViews.reduce((acc, childView) => {
    const { nestedViews } = childView;

    const childViewWithRoute = {
      ...childView,
      basePath,
      path: `${route.path}${childView.path}`,
      to: `${basePath}${route.path}${childView.path}`, // this is an absolute route so that the breadcrumbs work
    };

    if (!nestedViews) return [...acc, childViewWithRoute];
    const updatedNestedViews = nestedViews.map(nestedView => ({
      ...nestedView,
      path: `${route.path}${childView.path}${nestedView.path}`,

      parent: childViewWithRoute,
    }));

    return [
      ...acc,
      {
        ...childViewWithRoute,
        nestedViews: updatedNestedViews,
      },
      ...updatedNestedViews,
    ];
  }, []);
};

const App = () => {
  const { data: user } = useUser();
  const hasBESAdminAccess = getHasBESAdminAccess(user);
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
      <Route element={<AuthLayout />}>
        <Route path={AUTH_ROUTES.LOGIN} element={<LoginPage />} />
        <Route path={AUTH_ROUTES.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />
        <Route path={AUTH_ROUTES.RESET_PASSWORD} element={<ResetPasswordPage />} />
      </Route>
      <Route path="/" element={<PrivateRoute />}>
        <Route
          element={
            <AppPageLayout
              routes={accessibleRoutes}
              profileLink={{ label: 'Profile', to: '/profile' }}
            />
          }
        >
          <Route index element={<Navigate to="/surveys" replace />} />
          <Route path="*" element={<Navigate to="/surveys" replace />} />
          {[...accessibleRoutes, ...PROFILE_ROUTES].map(route => (
            <Route
              key={route.path || route.label}
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
                  key={childRoute.path || childRoute.title}
                  path={childRoute.path}
                  element={
                    childRoute.Component ? (
                      <childRoute.Component {...childRoute} />
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

export default App;
