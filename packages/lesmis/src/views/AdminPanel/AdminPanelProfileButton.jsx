/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import PropTypes from 'prop-types';
import { ProfileButton, ProfileButtonItem } from '@tupaia/ui-components';
import { useAdminPanelUrl } from '../../utils';

export const AdminPanelProfileButton = ({ user }) => {
  const adminUrl = useAdminPanelUrl();
  const ProfileLinks = () => (
    <>
      <ProfileButtonItem to={`${adminUrl}/logout`}>Logout</ProfileButtonItem>
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
