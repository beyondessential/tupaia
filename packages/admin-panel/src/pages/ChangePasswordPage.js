/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import { usePortalWithCallback } from '../utilities';
import { Header } from '../widgets';

export const ChangePasswordPage = ({ getHeaderEl }) => {
  const HeaderPortal = usePortalWithCallback(<Header title="Change password" />, getHeaderEl);
  return (
    <div>
      {HeaderPortal}
      <h2>Change Password</h2>
    </div>
  );
};

ChangePasswordPage.propTypes = {
  getHeaderEl: PropTypes.func.isRequired,
};
