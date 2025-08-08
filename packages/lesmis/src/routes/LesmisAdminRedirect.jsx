import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useUser } from '@tupaia/admin-panel';
import { hasAdminPanelAccess, useAdminPanelUrl, useUrlParams } from '../utils';

export const LesmisAdminRedirect = () => {
  const adminUrl = useAdminPanelUrl();
  const { data: user, isLoading } = useUser();
  const userHasAdminPanelAccess = hasAdminPanelAccess(user);
  const location = useLocation();
  const { locale } = useUrlParams();

  if (isLoading) {
    return null;
  }
  if (!userHasAdminPanelAccess) {
    return <Navigate to={`/${locale}/not-authorised`} replace />;
  }

  if (location.pathname === adminUrl) {
    return <Navigate to={`${adminUrl}/survey-responses`} replace />;
  }

  return <Outlet />;
};
