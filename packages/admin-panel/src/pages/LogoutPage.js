/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import { getIsUserAuthenticated, logout } from '../authentication';

const LogoutPageComponent = ({ onLogout, isLoggedIn }) => {
  useEffect(() => {
    onLogout();
  }, [onLogout]);

  if (!isLoggedIn) {
    return <Redirect to="/login" />;
  }

  return <div>Logging out...</div>;
};

LogoutPageComponent.propTypes = {
  isLoggedIn: PropTypes.bool,
  onLogout: PropTypes.func.isRequired,
};

LogoutPageComponent.defaultProps = {
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
