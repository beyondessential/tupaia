/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import PropTypes from 'prop-types';
import { Redirect, Route } from 'react-router-dom';
import { useUser } from '../api';

export const PrivateRoute = ({ children, ...rest }) => {
  const { isLoading, isSuccess, data: user } = useUser();
  const isLoggedIn = isSuccess && user !== undefined && user.name !== 'public';

  if (isLoading) {
    return 'loading...';
  }

  console.log('user', user);

  return (
    <Route
      {...rest}
      render={({ location }) =>
        isLoggedIn ? (
          children
        ) : (
          <Redirect
            to={{
              pathname: '/login',
              state: { from: location },
            }}
          />
        )
      }
    />
  );
};

PrivateRoute.propTypes = {
  children: PropTypes.any.isRequired,
};
