import React from 'react';
import { Navigate, Route, Routes as RouterRoutes, useLocation } from 'react-router-dom';
import { useUser } from './api/queries';
import { LoadingScreen } from './components';
import { DEFAULT_URL, MAP_OVERLAY_EXPORT_ROUTE, MODAL_ROUTES, ROUTE_STRUCTURE } from './constants';
import { Dashboard } from './features';
import { MainLayout } from './layout';
import { gaEvent, useEntityLink } from './utils';
import {
  DashboardPDFExport,
  LandingPage,
  MapOverlayPDFExport,
  ProjectPage,
  Unsubscribe,
} from './views';

const HomeRedirect = () => {
  const { isLoggedIn, data } = useUser();
  gaEvent('Navigate', 'Go Home');

  if (data?.project) {
    const { code, homeEntityCode, dashboardGroupName } = data.project;
    return <Navigate to={`/${code}/${homeEntityCode}/${dashboardGroupName}`} replace />;
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
  const to = useEntityLink();
  if (to === undefined) return null;
  return <Navigate to={to} replace />;
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
  const { isLoading, isFetched } = useUser();

  const showLoader = isLoading && !isFetched;

  /** Because we need the user login state to handle access errors, we need to load the user before doing anything else, and show a loader if the user is still loading */
  if (showLoader) {
    return <LoadingScreen isLoading />;
  }

  return (
    <RouterRoutes>
      <Route
        path="/:projectCode/:entityCode/:dashboardName/dashboard-pdf-export"
        element={<DashboardPDFExport />}
      />
      <Route path={MAP_OVERLAY_EXPORT_ROUTE} element={<MapOverlayPDFExport />} />
      <Route path="/unsubscribe" element={<Unsubscribe />} />
      <Route element={<MainLayout />}>
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

          {/* The Dashboard has to be rendered below the Map, otherwise the map will re-mount on route changes */}
          <Route path={ROUTE_STRUCTURE} element={<Dashboard />} />
        </Route>
      </Route>
    </RouterRoutes>
  );
};
