/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import PropTypes from 'prop-types';
import { ProfileButton as BaseProfileButton, ProfileButtonItem } from '@tupaia/ui-components';

export const ProfileButton = ({ user, isBESAdmin }) => {
  const ProfileLinks = () => (
    <>
      <ProfileButtonItem to="/profile">Edit Profile</ProfileButtonItem>
      {isBESAdmin && (
        <ProfileButtonItem to="/viz-builder/new">Visualisation builder</ProfileButtonItem>
      )}
      <ProfileButtonItem to="logout">Logout</ProfileButtonItem>
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
