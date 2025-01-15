import React from 'react';
import PropTypes from 'prop-types';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useUser } from '../api/queries';
import { AUTH_ROUTES } from '../routes';

/*
 * A wrapper for <Route> that redirects to the login
 * screen if you're not yet authenticated.
 */
export const PrivateRoute = ({ basePath = '' }) => {
  const location = useLocation();
  const { isLoggedIn, isLoading } = useUser();
  if (isLoading) return null;

  if (!isLoggedIn) {
    return <Navigate to={`${basePath}${AUTH_ROUTES.LOGIN}`} state={{ from: location.pathname }} />;
  }
  return <Outlet />;
};

PrivateRoute.propTypes = {
  basePath: PropTypes.string,
};

PrivateRoute.defaultProps = {
  basePath: '',
};
