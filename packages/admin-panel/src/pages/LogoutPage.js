/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import { getIsUserAuthenticated, logout } from '../authentication';

const LogoutPageComponent = ({ redirectTo, onLogout, isLoggedIn }) => {
  useEffect(() => {
    onLogout();
  }, [onLogout]);

  if (!isLoggedIn) {
    return <Redirect to={redirectTo} />;
  }

  return <div>Logging out...</div>;
};

LogoutPageComponent.propTypes = {
  redirectTo: PropTypes.string,
  isLoggedIn: PropTypes.bool,
  onLogout: PropTypes.func.isRequired,
};

LogoutPageComponent.defaultProps = {
  redirectTo: '/login',
  isLoggedIn: true,
};

export const LogoutPage = connect(
  state => ({
    isLoggedIn: getIsUserAuthenticated(state),
  }),
  dispatch => ({
    onLogout: () => dispatch(logout()),
  }),
)(LogoutPageComponent);
