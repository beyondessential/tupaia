/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { Navigate, Route, Routes as RouterRoutes, useLocation, useParams } from 'react-router-dom';
import { LandingPage, ProjectPage } from './views';
import { ModalRoutes } from './ModalRoutes';
import { MODAL_ROUTES, DEFAULT_URL } from './constants';
import { useUser } from './api/queries';
import { LoadingScreen } from './components';
import { MainLayout } from './layout';
import { useProject } from './api/queries';

/*
 * Redirect to the dashboardGroupName of the project if a dashboard name is not provided
 */
const ProjectPageDashboardRedirect = () => {
  const location = useLocation();
  const { projectCode, entityCode } = useParams();
  const { data: project, isLoading } = useProject(projectCode);

  const newDashboardName = isLoading ? '' : project.dashboardGroupName;
  const url = { ...location, pathname: `/${projectCode}/${entityCode}/${newDashboardName}` };

  return <Navigate to={url} replace />;
};

/**
 * This Router is using [version 6.3]{@link https://reactrouter.com/en/v6.3.0}, as later versions are not supported by our TS setup. See [this issue here]{@link https://github.com/remix-run/react-router/discussions/8364}
 * This means the newer 'createBrowserRouter' and 'RouterProvider' can't be used here.
 *
 *
 * * */

const HomeRedirect = () => {
  const { isLoading, isLoggedIn } = useUser();

  if (isLoading) {
    return <LoadingScreen isLoading />;
  }
  return (
    <Navigate
      to={`${DEFAULT_URL}#${isLoggedIn ? MODAL_ROUTES.PROJECTS : MODAL_ROUTES.LOGIN}`}
      replace
    />
  );
};
export const Routes = () => {
  const location = useLocation();
  // if the user is loading, show a loading screen, so that we can handle redirects when this is done

  return (
    <>
      <ModalRoutes />
      <RouterRoutes>
        {/* This is the layout for the entire app, so needs to be wrapped around the rest of the routes so that we can access params in top bar etc */}

        <Route element={<MainLayout />}>
          <Route path="/" element={<HomeRedirect />} />
          {/* Email verification links redirect to the login page where the verification happens */}
          <Route
            path="/verify-email"
            element={
              <Navigate
                to={{
                  ...location,
                  hash: MODAL_ROUTES.LOGIN,
                  pathname: DEFAULT_URL,
                }}
                replace
              />
            }
          />
          <Route
            path="/reset-password"
            element={
              <Navigate
                to={{
                  ...location,
                  pathname: DEFAULT_URL,
                  hash: MODAL_ROUTES.RESET_PASSWORD,
                }}
                replace
              />
            }
          />
          {/* Redirect modal routes to the correct routes just in case */}
          <Route
            path="/login"
            element={<Navigate to={{ pathname: DEFAULT_URL, hash: MODAL_ROUTES.LOGIN }} replace />}
          />
          <Route
            path="/register"
            element={
              <Navigate to={{ pathname: DEFAULT_URL, hash: MODAL_ROUTES.REGISTER }} replace />
            }
          />
          <Route
            path="/projects"
            element={
              <Navigate to={{ pathname: DEFAULT_URL, hash: MODAL_ROUTES.PROJECTS }} replace />
            }
          />
          <Route path="/:landingPageUrlSegment" element={<LandingPage />} />
          <Route path="/:projectCode/:entityCode" element={<ProjectPageDashboardRedirect />} />
          <Route path="/:projectCode/:entityCode/:dashboardName" element={<ProjectPage />} />
        </Route>
      </RouterRoutes>
    </>
  );
};
