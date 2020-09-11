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
  checkIsAuthorised,
  currentUser,
  children,
  UnAuthorisedViewComponent,
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

      if (checkIsAuthorised) {
        const isAuthorised = checkIsAuthorised(match, currentUser);

        if (!isAuthorised) {
          return <UnAuthorisedViewComponent />;
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
  checkIsAuthorised: PropTypes.func,
  UnAuthorisedViewComponent: PropTypes.elementType,
};

PrivateRouteComponent.defaultProps = {
  isLoggedIn: false,
  checkIsAuthorised: null,
  currentUser: null,
  UnAuthorisedViewComponent: UnAuthorisedView,
};

const mapStateToProps = state => ({
  isLoggedIn: checkIsLoggedIn(state),
  currentUser: getCurrentUser(state),
});

export const PrivateRoute = connect(mapStateToProps)(PrivateRouteComponent);
