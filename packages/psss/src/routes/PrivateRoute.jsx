import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Redirect, Route } from 'react-router-dom';
import { checkIsLoggedIn, getCurrentUser } from '../store';

export const PrivateRouteComponent = ({
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

PrivateRouteComponent.propTypes = {
  children: PropTypes.node.isRequired,
  isLoggedIn: PropTypes.bool,
  currentUser: PropTypes.object,
  authCheck: PropTypes.func,
  redirectTo: PropTypes.string,
};

PrivateRouteComponent.defaultProps = {
  isLoggedIn: false,
  authCheck: null,
  currentUser: null,
  redirectTo: '/unauthorised',
};

const mapStateToProps = state => ({
  isLoggedIn: checkIsLoggedIn(state),
  currentUser: getCurrentUser(state),
});

export const PrivateRoute = connect(mapStateToProps)(PrivateRouteComponent);
