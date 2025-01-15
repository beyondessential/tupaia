import React, { ReactElement } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useCurrentUserContext } from '../api';
import { ADMIN_ONLY_ROUTES, ROUTES } from '../constants';
import { isPWA } from '../utils';

// Reusable wrapper to handle redirecting to login if user is not logged in and the route is private
export const PrivateRoute = ({ children }: { children?: ReactElement }): ReactElement => {
  const { isLoggedIn, hasAdminPanelAccess, hideWelcomeScreen, ...user } = useCurrentUserContext();
  const { pathname, search } = useLocation();

  if (!isLoggedIn) {
    return (
      <Navigate
        to="/login"
        replace={true}
        state={{
          from: `${pathname}${search}`,
        }}
      />
    );
  }

  // If the user is logged in and has not seen the welcome screen, redirect to the welcome screen
  if (isPWA() && !hideWelcomeScreen && pathname !== ROUTES.WELCOME) {
    return <Navigate to={ROUTES.WELCOME} replace={true} />;
  }

  const PROJECT_SELECT_URLS = [ROUTES.PROJECT_SELECT, ROUTES.REQUEST_ACCESS];
  // If the user is logged in and has a project, but is attempting to go to the project select page, redirect to the home page
  if (user.projectId && PROJECT_SELECT_URLS.includes(pathname)) {
    return <Navigate to={ROUTES.HOME} replace={true} />;
  }

  // If the user is logged in and does not have a project and is not already on the project select page, redirect to the project select page
  if (!user.projectId && !PROJECT_SELECT_URLS.includes(pathname)) {
    return (
      <Navigate
        to={ROUTES.PROJECT_SELECT}
        replace={true}
        state={{
          from: `${pathname}${search}`,
        }}
      />
    );
  }

  const isAdminOnlyRoute = ADMIN_ONLY_ROUTES.includes(pathname);

  // If the user is logged in but is not an admin and is trying to access an admin only page, redirect to the home page
  if (isAdminOnlyRoute && !hasAdminPanelAccess) {
    return <Navigate to={ROUTES.HOME} replace={true} />;
  }
  return children ? children : <Outlet />;
};
