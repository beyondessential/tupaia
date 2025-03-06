import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useUser } from '../api/queries';
import { AUTH_ROUTES } from '../routes';

export const VizBuilderPrivateRoute = () => {
  const location = useLocation();
  const { isLoggedIn, isLoading, hasVizBuilderAccess } = useUser();
  if (isLoading) return null;

  if (!isLoggedIn) {
    return <Navigate to={AUTH_ROUTES.LOGIN} state={{ from: location.pathname }} />;
  }

  if (!hasVizBuilderAccess) {
    return <Navigate to="/" state={{ from: location.pathname }} />;
  }

  return <Outlet />;
};
