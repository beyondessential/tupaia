/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 *
 */
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useUser } from '@tupaia/admin-panel';
import { hasAdminPanelAccess } from '../utils';

export const LesmisAdminRedirect = () => {
  const { data: user } = useUser();
  const userHasAdminPanelAccess = hasAdminPanelAccess(user);
  if (!userHasAdminPanelAccess) {
    return <Navigate to="/not-authorised" replace />;
  }

  return <Outlet />;
};
