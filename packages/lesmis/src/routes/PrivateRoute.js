/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import PropTypes from 'prop-types';
import { Redirect, Route } from 'react-router-dom';

export const PrivateRoute = ({
  isLoggedIn,
  authCheck,
  currentUser,
  children,
  redirectTo,
  ...props
}) => (
  <Route
    {...props}
    render={({ location, match }) => {
      if (!isLoggedIn) {
        return (
          <Redirect
            to={{
              pathname: '/login',
              state: { from: location },
            }}
          />
        );
      }

      if (authCheck) {
        const isAuthorised = authCheck(match);
        if (!isAuthorised) {
          return (
            <Redirect
              to={{
                pathname: redirectTo,
                state: { from: location },
              }}
            />
          );
        }
      }

      return children;
    }}
  />
);

PrivateRoute.propTypes = {
  children: PropTypes.any.isRequired,
  isLoggedIn: PropTypes.bool,
  currentUser: PropTypes.object,
  authCheck: PropTypes.func,
  redirectTo: PropTypes.string,
};

PrivateRoute.defaultProps = {
  isLoggedIn: true,
  authCheck: null,
  currentUser: null,
  redirectTo: '/unauthorised',
};
