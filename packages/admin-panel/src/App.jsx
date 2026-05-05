import React, { useCallback, useMemo } from 'react';
import { Navigate, Route, Routes, useParams } from 'react-router-dom';

import { PrivateRoute } from './authentication';
import { AppPageLayout, AuthLayout, Footer } from './layout';
import { TabPageLayout } from './layout/TabPageLayout';
import { ForgotPasswordPage, ResetPasswordPage } from './pages';
import { LoginPage } from './pages/LoginPage';
import { ResourcePage } from './pages/resources/ResourcePage';
import { PROFILE_ROUTES } from './profileRoutes';
import { AUTH_ROUTES, ROUTES } from './routes';
import {
  ALL_DATA_BASE_PATH,
  ALL_PROJECTS_SCOPE,
  SINGLE_PROJECT_PATH_PARAM,
  SINGLE_PROJECT_ROUTE_BASE,
  SINGLE_PROJECT_SCOPE,
  filterRoutesByScope,
} from './routes/scopes';
import { DefaultRedirect, ProjectRouteScope } from './projects';
import { useHasBesAdminAccess, useUserPermissionGroups } from './utilities';

export const getFlattenedChildViews = (route, pathPrefix = '', basePath = '') => {
  return route.childViews.reduce((acc, childView) => {
    const { nestedViews } = childView;

    const childViewWithRoute = {
      ...childView,
      basePath,
      path: `${pathPrefix}${route.path}${childView.path}`,
      to: `${basePath}${pathPrefix}${route.path}${childView.path}`, // this is an absolute route so that the breadcrumbs work
    };

    if (!nestedViews) {
      acc.push(childViewWithRoute);
      return acc;
    }

    const updatedNestedViews = nestedViews.map(nestedView => ({
      ...nestedView,
      path: `${pathPrefix}${route.path}${childView.path}${nestedView.path}`,
      parent: childViewWithRoute,
    }));

    acc.push(
      {
        ...childViewWithRoute,
        nestedViews: updatedNestedViews,
      },
      ...updatedNestedViews,
    );
    return acc;
  }, []);
};

// Replaces React Router param tokens (e.g. `:projectCode`) in a target URL
// with their live values from `useParams()`. Used by route catch-alls whose
// target is a parameterised path string.
const ParamAwareNavigate = ({ to }) => {
  const params = useParams();
  const resolved = Object.entries(params).reduce(
    (url, [key, value]) => (value ? url.replaceAll(`:${key}`, value) : url),
    to,
  );
  return <Navigate to={resolved} replace />;
};

const renderSectionRoutes = (sectionRoutes, pathPrefix, hasBESAdminAccess) =>
  sectionRoutes.map(route => {
    const sectionRoutePath = `${pathPrefix}${route.path}`;
    const firstChild = route.childViews[0];
    const firstChildPath = `${sectionRoutePath}${firstChild?.path ?? ''}`;
    return (
      <Route
        key={sectionRoutePath}
        path={sectionRoutePath}
        element={
          <TabPageLayout
            routes={route.childViews}
            basePath={sectionRoutePath}
            Footer={<Footer />}
          />
        }
      >
        {getFlattenedChildViews(route, pathPrefix).map(childRoute => (
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
        <Route path="*" element={<ParamAwareNavigate to={firstChildPath} />} />
      </Route>
    );
  });

const App = () => {
  const hasBESAdminAccess = useHasBesAdminAccess();

  const userPermissionGroups = useUserPermissionGroups();
  const userHasPermissionGroup = useCallback(
    pg => userPermissionGroups?.has(pg) ?? false,
    [userPermissionGroups],
  );

  const userHasAccessToTab = useCallback(
    tab => {
      if (
        Array.isArray(tab.requiresSomePermissionGroup) &&
        tab.requiresSomePermissionGroup.length > 0
      ) {
        return tab.requiresSomePermissionGroup.some(userHasPermissionGroup);
      }
      return true;
    },
    [userHasPermissionGroup],
  );

  // Filter out tabs that the user does not have access to, and hide top-level
  // routes that have no accessible tabs
  const accessibleRoutes = useMemo(
    () =>
      ROUTES.map(route => ({
        ...route,
        childViews: route.childViews.filter(childView => userHasAccessToTab(childView)),
      })).filter(route => {
        if (
          Array.isArray(route.requiresSomePermissionGroup) &&
          route.requiresSomePermissionGroup.length > 0
        ) {
          return route.requiresSomePermissionGroup.some(userHasPermissionGroup);
        }
        return route.childViews.length > 0;
      }),
    [userHasAccessToTab, userHasPermissionGroup],
  );

  const allDataRoutes = useMemo(
    () => filterRoutesByScope(accessibleRoutes, ALL_PROJECTS_SCOPE),
    [accessibleRoutes],
  );
  const singleProjectRoutes = useMemo(
    () => filterRoutesByScope(accessibleRoutes, SINGLE_PROJECT_SCOPE),
    [accessibleRoutes],
  );

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
              allDataRoutes={allDataRoutes}
              singleProjectRoutes={singleProjectRoutes}
              profileLink={{ label: 'Edit profile', to: '/profile' }}
            />
          }
        >
          <Route
            index
            element={
              <DefaultRedirect
                allDataRoutes={allDataRoutes}
                singleProjectRoutes={singleProjectRoutes}
              />
            }
          />
          {renderSectionRoutes(allDataRoutes, ALL_DATA_BASE_PATH, hasBESAdminAccess)}
          <Route path={`:${SINGLE_PROJECT_PATH_PARAM}`} element={<ProjectRouteScope />}>
            {renderSectionRoutes(singleProjectRoutes, SINGLE_PROJECT_ROUTE_BASE, hasBESAdminAccess)}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
          {PROFILE_ROUTES.map(route => (
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
          <Route
            path="*"
            element={
              <DefaultRedirect
                allDataRoutes={allDataRoutes}
                singleProjectRoutes={singleProjectRoutes}
              />
            }
          />
        </Route>
      </Route>
    </Routes>
  );
};

export default App;
