/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Redirect, Route } from 'react-router-dom';
import { checkIsLoggedIn, getCurrentUser } from '../store';
import { UnAuthorisedView } from '../views/UnauthorisedView';

export const PrivateRouteComponent = ({
  isLoggedIn,
  accessPolicy,
  currentUser,
  children,
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

      if (accessPolicy) {
        const isAuthorised = accessPolicy(match, currentUser);

        if (!isAuthorised) {
          return <UnAuthorisedView />;
        }
      }

      return children;
    }}
  />
);

PrivateRouteComponent.propTypes = {
  children: PropTypes.any.isRequired,
  isLoggedIn: PropTypes.bool,
  currentUser: PropTypes.object,
  accessPolicy: PropTypes.func,
};

PrivateRouteComponent.defaultProps = {
  isLoggedIn: false,
  accessPolicy: null,
  currentUser: null,
};

const mapStateToProps = state => ({
  isLoggedIn: checkIsLoggedIn(state),
  currentUser: getCurrentUser(state),
});

export const PrivateRoute = connect(mapStateToProps)(PrivateRouteComponent);
