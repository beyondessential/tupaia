import React, { ReactElement, useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { isFeatureEnabled } from '@tupaia/utils';
import { ensure } from '@tupaia/tsutils';
import { TUPAIA_ADMIN_PANEL_PERMISSION_GROUP } from '@tupaia/constants';

import { useCurrentUserContext } from '../api';
import { ADMIN_ONLY_ROUTES, ROUTES } from '../constants';
import { isWebApp } from '../utils';
import { useDatabaseContext } from '../hooks/database';
import { useIsOfflineFirst } from '../api/offlineFirst';

// Reusable wrapper to handle redirecting to login if user is not logged in and the route is private
export const PrivateRoute = ({ children }: { children?: ReactElement }): ReactElement => {
  const { isLoggedIn, hideWelcomeScreen, accessPolicy, ...user } = useCurrentUserContext();
  const { pathname, search } = useLocation();
  const { models } = useDatabaseContext() || {};
  const isOfflineFirst = useIsOfflineFirst();
  const hasAdminPanelAccess =
    accessPolicy?.allowsSome(undefined, TUPAIA_ADMIN_PANEL_PERMISSION_GROUP) ?? false;

  useEffect(() => {
    if (isLoggedIn && user.projectId && isOfflineFirst) {
      const addProjectForSync = async () => {
        await ensure(models).localSystemFact.addProjectForSync(
          user.projectId!, // Not sure why TypeScript doesn’t infer this must be a string
        );
      };
      addProjectForSync();
    }
  }, [models, isLoggedIn, user.projectId, isOfflineFirst]);

  if (!isLoggedIn) {
    return (
      <Navigate
        to={ROUTES.LOGIN}
        replace={true}
        state={{
          from: `${pathname}${search}`,
        }}
      />
    );
  }

  // If the user is logged in and has not seen the welcome screen, redirect to the welcome screen
  if (
    isFeatureEnabled('DATATRAK_OFFLINE') &&
    isWebApp() &&
    !hideWelcomeScreen &&
    pathname !== ROUTES.WELCOME
  ) {
    return <Navigate to={ROUTES.WELCOME} replace={true} />;
  }

  const PROJECT_SELECT_URLS = [ROUTES.PROJECT_SELECT, ROUTES.REQUEST_ACCESS];
  // If the user is logged in and has a project, but is attempting to go to the project select page, redirect to the home page
  if (user.projectId && PROJECT_SELECT_URLS.includes(pathname)) {
    return <Navigate to={ROUTES.HOME} replace={true} />;
  }

  // If the user is logged in, does not have a project, and is not already on the project select
  // page, redirect to the project select page. (But let them complete on-boarding first.)
  if (!user.projectId && !PROJECT_SELECT_URLS.includes(pathname) && pathname !== ROUTES.WELCOME) {
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
