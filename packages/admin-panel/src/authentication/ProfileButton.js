/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { ProfileButton as BaseProfileButton, ProfileButtonItem } from '@tupaia/ui-components';
import { logout } from './actions';
import { getUser } from './selectors';

// Todo: add profile section and active this link
// https://github.com/beyondessential/tupaia-backlog/issues/1118
const ProfileLinksComponent = ({ onLogout }) => (
  <>
    {/* <ProfileButtonItem to="/profile">Edit Profile</ProfileButtonItem> */}
    <ProfileButtonItem button onClick={onLogout}>
      Logout
    </ProfileButtonItem>
  </>
);

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
  user: PropTypes.shape({
    name: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    firstName: PropTypes.string,
  }).isRequired,
};

export const ProfileButton = connect(
  state => ({
    user: getUser(state),
  }),
  null,
)(ProfileButtonComponent);
