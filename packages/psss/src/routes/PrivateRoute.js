/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Redirect, Route } from 'react-router-dom';
import { checkIsLoggedIn } from '../store';

/*
 * A wrapper for <Route> that redirects to the login
 * screen if you're not yet authenticated.
 * */
export const PrivateRouteComponent = ({ isLoggedIn, children, ...props }) => {
  return (
    <Route
      {...props}
      render={({ location }) => {
        return isLoggedIn ? (
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

PrivateRouteComponent.propTypes = {
  children: PropTypes.any.isRequired,
  isLoggedIn: PropTypes.bool,
};

PrivateRouteComponent.defaultProps = {
  isLoggedIn: false,
};

const mapStateToProps = state => ({
  isLoggedIn: checkIsLoggedIn(state),
});

export const PrivateRoute = connect(mapStateToProps)(PrivateRouteComponent);
