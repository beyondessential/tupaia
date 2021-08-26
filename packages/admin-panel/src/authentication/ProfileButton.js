/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import { ProfileButton as BaseProfileButton, ProfileButtonItem } from '@tupaia/ui-components';

export const ProfileButton = ({ user, isBESAdmin }) => {
  const location = useLocation();
  const inVizBuilder = location.pathname.startsWith('/viz-builder');
  const ProfileLinks = () => (
    <>
      <ProfileButtonItem to="/profile">Edit Profile</ProfileButtonItem>
      {isBESAdmin && !inVizBuilder && (
        <ProfileButtonItem to="/viz-builder/new">Visualisation Builder</ProfileButtonItem>
      )}
      {inVizBuilder && (
        <ProfileButtonItem to="/dashboard-items">Exit Visualisation Builder</ProfileButtonItem>
      )}
      <ProfileButtonItem to="/logout">Logout</ProfileButtonItem>
    </>
  );
  return <BaseProfileButton user={user} MenuOptions={ProfileLinks} />;
};

ProfileButton.propTypes = {
  user: PropTypes.shape({
    name: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    firstName: PropTypes.string,
    profileImage: PropTypes.string,
  }).isRequired,
  isBESAdmin: PropTypes.bool,
};

ProfileButton.defaultProps = {
  isBESAdmin: false,
};
