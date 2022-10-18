/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import PropTypes from 'prop-types';
import { ProfileButton, ProfileButtonItem } from '@tupaia/ui-components';

export const AdminPanelProfileButton = ({ user }) => {
  const ProfileLinks = () => (
    <>
      <ProfileButtonItem to="/logout">Logout</ProfileButtonItem>
    </>
  );
  return <ProfileButton user={user} MenuOptions={ProfileLinks} />;
};

AdminPanelProfileButton.propTypes = {
  user: PropTypes.shape({
    name: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    firstName: PropTypes.string,
    profileImage: PropTypes.string,
  }).isRequired,
};
