/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { ProfileButton as BaseProfileButton, ProfileButtonItem } from '@tupaia/ui-components';
import { getCurrentUser, logout } from '../store';

const ProfileLinksComponent = ({ onLogout }) => {
  const handleClickLogout = () => {
    onLogout();
  };

  return (
    <>
      <ProfileButtonItem to="/profile">Edit Profile</ProfileButtonItem>
      <ProfileButtonItem button to="/logout" onClick={handleClickLogout}>
        Logout
      </ProfileButtonItem>
    </>
  );
};

ProfileLinksComponent.propTypes = {
  onLogout: PropTypes.func.isRequired,
};

const ProfileLinks = connect(null, dispatch => ({
  onLogout: () => dispatch(logout()),
}))(ProfileLinksComponent);

const ProfileButtonComponent = ({ user }) => (
  <BaseProfileButton user={user} MenuOptions={ProfileLinks} />
);

ProfileButtonComponent.propTypes = {
  user: PropTypes.object.isRequired,
};

export const ProfileButton = connect(
  state => ({
    user: getCurrentUser(state),
  }),
  null,
)(ProfileButtonComponent);
