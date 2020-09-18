/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import { usePortalWithCallback } from '../utilities';
import { Header } from '../widgets';

export const ProfileView = ({ getHeaderEl }) => {
  const HeaderPortal = usePortalWithCallback(<Header title="Profile" />, getHeaderEl);
  return (
    <div>
      {HeaderPortal}
      <h2>User Profile</h2>
    </div>
  );
};

ProfileView.propTypes = {
  getHeaderEl: PropTypes.func.isRequired,
};
