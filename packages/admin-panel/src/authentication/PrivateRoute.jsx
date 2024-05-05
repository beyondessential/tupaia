/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { getIsUserAuthenticated } from './selectors';

/*
 * A wrapper for <Route> that redirects to the login
 * screen if you're not yet authenticated.
 */
export const PrivateRouteComponent = ({ loginPath, isLoggedIn }) => {
  const location = useLocation();
  if (!isLoggedIn) {
    return <Navigate to={loginPath} state={{ from: location.pathname }} />;
  }
  return <Outlet />;
};

PrivateRouteComponent.propTypes = {
  isLoggedIn: PropTypes.bool,
  loginPath: PropTypes.string,
};

PrivateRouteComponent.defaultProps = {
  isLoggedIn: false,
  loginPath: '/login',
};

const mapStateToProps = state => ({
  isLoggedIn: getIsUserAuthenticated(state),
});

export const PrivateRoute = connect(mapStateToProps)(PrivateRouteComponent);
