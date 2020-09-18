/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import { usePortalWithCallback } from '../utilities';
import { Header } from '../widgets';

export const ChangePasswordView = ({ getHeaderEl }) => {
  const HeaderPortal = usePortalWithCallback(<Header title="Change password" />, getHeaderEl);
  return (
    <div>
      {HeaderPortal}
      <h2>Change Password</h2>
    </div>
  );
};

ChangePasswordView.propTypes = {
  getHeaderEl: PropTypes.func.isRequired,
};
