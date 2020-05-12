/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import PropTypes from 'prop-types';
import { Redirect, Route } from 'react-router-dom';
import { useAuthState } from '../hooks';

/*
 * A wrapper for <Route> that redirects to the login
 * screen if you're not yet authenticated.
 * */
export const PrivateRoute = ({ children, ...props }) => {
  const { isAuthenticated } = useAuthState();

  return (
    <Route
      {...props}
      render={({ location }) => {
        return isAuthenticated ? (
          children
        ) : (
          <Redirect
            to={{
              pathname: '/login',
              state: { from: location },
            }}
          />
        );
      }}
    />
  );
};

PrivateRoute.propTypes = {
  children: PropTypes.any.isRequired,
};
