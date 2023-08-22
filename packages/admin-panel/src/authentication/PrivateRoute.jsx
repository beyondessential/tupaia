/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Redirect, Route } from 'react-router-dom';
import { getIsUserAuthenticated } from './selectors';

/*
 * A wrapper for <Route> that redirects to the login
 * screen if you're not yet authenticated.
 */
export const PrivateRouteComponent = ({ loginPath, isLoggedIn, children, ...props }) => {
  return (
    <Route
      {...props}
      render={({ location }) => {
        return isLoggedIn ? (
          children
        ) : (
          <Redirect
            to={{
              pathname: loginPath,
              state: { from: location },
            }}
          />
        );
      }}
    />
  );
};

PrivateRouteComponent.propTypes = {
  children: PropTypes.node.isRequired,
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
