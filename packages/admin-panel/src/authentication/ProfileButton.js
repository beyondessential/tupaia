/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { ProfileButton as BaseProfileButton, ProfileButtonItem } from '@tupaia/ui-components';
import { logout } from './actions';
import { getUser, getIsBESAdmin } from './selectors';

const ProfileButtonComponent = ({ user, onLogout, isBESAdmin }) => {
  const ProfileLinks = () => (
    <>
      <ProfileButtonItem to="/profile">Edit Profile</ProfileButtonItem>
      {isBESAdmin && <ProfileButtonItem to="/viz-builder">Visualisation builder</ProfileButtonItem>}
      <ProfileButtonItem button onClick={onLogout}>
        Logout
      </ProfileButtonItem>
    </>
  );
  return <BaseProfileButton user={user} MenuOptions={ProfileLinks} />;
};

ProfileButtonComponent.propTypes = {
  onLogout: PropTypes.func.isRequired,
  user: PropTypes.shape({
    name: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    firstName: PropTypes.string,
    profileImage: PropTypes.string,
  }).isRequired,
  isBESAdmin: PropTypes.bool,
};

ProfileButtonComponent.defaultProps = {
  isBESAdmin: false,
};

export const ProfileButton = connect(
  state => ({
    user: getUser(state),
    isBESAdmin: getIsBESAdmin(state),
  }),
  dispatch => ({
    onLogout: () => dispatch(logout()),
  }),
)(ProfileButtonComponent);
