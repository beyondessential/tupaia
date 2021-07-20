/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import { getIsUserAuthenticated } from '../authentication';

const LogoutPageComponent = ({ isLoggedIn }) => {
  if (!isLoggedIn) {
    return <Redirect to="/login" />;
  }

  return <div>Logging out...</div>;
};

LogoutPageComponent.propTypes = {
  isLoggedIn: PropTypes.bool,
};

LogoutPageComponent.defaultProps = {
  isLoggedIn: true,
};

export const LogoutPage = connect(
  state => ({
    isLoggedIn: getIsUserAuthenticated(state),
  }),
  null,
)(LogoutPageComponent);
