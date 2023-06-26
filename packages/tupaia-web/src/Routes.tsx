/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { Navigate, Route, Routes as RouterRoutes, useLocation, useParams } from 'react-router-dom';
import { LandingPage, ProjectPage } from './views';
import { Dashboard } from './features';
import { ModalRoutes } from './ModalRoutes';
import { MODAL_ROUTES, DEFAULT_URL } from './constants';
import { useProject, useUser } from './api/queries';
import { LoadingScreen } from './components';

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

const UserPageRedirect = ({ modal }: { modal: MODAL_ROUTES }) => {
  const location = useLocation();
  return (
    <Navigate
      to={{
        ...location,
        hash: modal,
        pathname: DEFAULT_URL,
      }}
      replace
    />
  );
};

/**
 * This Router is using [version 6.3]{@link https://reactrouter.com/en/v6.3.0}, as later versions are not supported by our TS setup. See [this issue here]{@link https://github.com/remix-run/react-router/discussions/8364}
 * This means the newer 'createBrowserRouter' and 'RouterProvider' can't be used here.
 *
 * **/
export const Routes = () => {
  return (
    <>
      <ModalRoutes />
      <RouterRoutes>
        <Route path="/:landingPageUrlSegment" element={<LandingPage />} />
        <Route element={<ProjectPage />}>
          <Route path="/" element={<HomeRedirect />} />
          {/* Email verification links redirect to the login page where the verification happens */}
          <Route path="/verify-email" element={<UserPageRedirect modal={MODAL_ROUTES.LOGIN} />} />
          <Route
            path="/reset-password"
            element={<UserPageRedirect modal={MODAL_ROUTES.RESET_PASSWORD} />}
          />
          {/* Redirect modal routes to the correct routes just in case */}
          <Route path="/login" element={<UserPageRedirect modal={MODAL_ROUTES.LOGIN} />} />
          <Route path="/register" element={<UserPageRedirect modal={MODAL_ROUTES.REGISTER} />} />
          <Route path="/projects" element={<UserPageRedirect modal={MODAL_ROUTES.PROJECTS} />} />
          <Route path="/:projectCode/:entityCode" element={<ProjectPageDashboardRedirect />} />

          <Route path="/:projectCode/:entityCode/:dashboardName" element={<Dashboard />} />
        </Route>
      </RouterRoutes>
    </>
  );
};
