/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 *
 */
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

export const LesmisAdminRedirect = ({ hasAdminPanelAccess = false }) => {
  if (!hasAdminPanelAccess) {
    return <Navigate to="/not-authorised" replace />;
  }

  return <Outlet />;
};
