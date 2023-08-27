/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { Navigate, Route, Routes as RouterRoutes, useLocation } from 'react-router-dom';
import { LandingPage, PDFExport, ProjectPage } from './views';
import { Dashboard } from './features';
import { ModalRoutes } from './ModalRoutes';
import { MODAL_ROUTES, DEFAULT_URL } from './constants';
import { useUser } from './api/queries';
import { MainLayout } from './layout';
import { LoadingScreen } from './components';
import { gaEvent, useEntityLink } from './utils';

const HomeRedirect = () => {
  const { isLoggedIn } = useUser();
  gaEvent('Navigate', 'Go Home');

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
  const url = useEntityLink();
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
  const { isLoading } = useUser();
  return (
    <>
      <ModalRoutes />
      {/** Because we need the user login state to handle access errors, we need to load the user before doing anything else, and show a loader if the user is still loading */}
      {isLoading ? (
        <LoadingScreen isLoading />
      ) : (
        <RouterRoutes>
          <Route
            path="/:projectCode/:entityCode/:dashboardName/pdf-export"
            element={<PDFExport />}
          />
          <Route element={<MainLayout />}>
            <Route path="/:landingPageUrlSegment" element={<LandingPage />} />
            <Route element={<ProjectPage />}>
              <Route path="/" element={<HomeRedirect />} />
              {/* Email verification links redirect to the login page where the verification happens */}
              <Route
                path="/verify-email"
                element={<UserPageRedirect modal={MODAL_ROUTES.LOGIN} />}
              />
              <Route
                path="/reset-password"
                element={<UserPageRedirect modal={MODAL_ROUTES.RESET_PASSWORD} />}
              />
              {/* Redirect modal routes to the correct routes just in case */}
              <Route path="/login" element={<UserPageRedirect modal={MODAL_ROUTES.LOGIN} />} />
              <Route
                path="/register"
                element={<UserPageRedirect modal={MODAL_ROUTES.REGISTER} />}
              />
              <Route
                path="/projects"
                element={<UserPageRedirect modal={MODAL_ROUTES.PROJECTS} />}
              />
              <Route path="/:projectCode/:entityCode" element={<ProjectPageDashboardRedirect />} />

              {/* The Dashboard has to be rendered below the Map, otherwise the map will re-mount on route changes */}
              <Route path="/:projectCode/:entityCode/:dashboardName" element={<Dashboard />} />
            </Route>
          </Route>
        </RouterRoutes>
      )}
    </>
  );
};
