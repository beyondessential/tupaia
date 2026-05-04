import React, { useCallback, useMemo } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import { PrivateRoute } from './authentication';
import { AppPageLayout, AuthLayout, Footer } from './layout';
import { TabPageLayout } from './layout/TabPageLayout';
import { ForgotPasswordPage, ResetPasswordPage } from './pages';
import { LoginPage } from './pages/LoginPage';
import { ResourcePage } from './pages/resources/ResourcePage';
import { PROFILE_ROUTES } from './profileRoutes';
import { AUTH_ROUTES, ROUTES } from './routes';
import {
  ALL_PROJECTS_SCOPE,
  SECTIONS,
  SINGLE_PROJECT_SCOPE,
  filterRoutesByScope,
} from './routes/scopes';
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
        <Route path="*" element={<Navigate to={firstChildPath} replace />} />
      </Route>
    );
  });

const getDefaultRedirect = (allDataRoutes, singleProjectRoutes) => {
  const fallback = allDataRoutes[0] ?? singleProjectRoutes[0];
  if (!fallback) return '/login';
  const section = allDataRoutes.length > 0 ? SECTIONS[0] : SECTIONS[1];
  const firstChild = fallback.childViews[0];
  return `${section.basePath}${fallback.path}${firstChild?.path ?? ''}`;
};

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
  const defaultRedirect = getDefaultRedirect(allDataRoutes, singleProjectRoutes);

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
              profileLink={{ label: 'Profile', to: '/profile' }}
            />
          }
        >
          <Route index element={<Navigate to={defaultRedirect} replace />} />
          {renderSectionRoutes(allDataRoutes, SECTIONS[0].basePath, hasBESAdminAccess)}
          {renderSectionRoutes(singleProjectRoutes, SECTIONS[1].basePath, hasBESAdminAccess)}
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
              <Route
                path="*"
                element={<Navigate to={route.childViews[0].path} replace />}
              />
            </Route>
          ))}
          <Route path="*" element={<Navigate to={defaultRedirect} replace />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default App;
