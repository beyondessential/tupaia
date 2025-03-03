import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { ProfileButton as BaseProfileButton, ProfileButtonItem } from '@tupaia/ui-components';
import { getCurrentUser, logout } from '../store';

const ProfileLinksComponent = ({ onLogout }) => (
  <>
    {/* Removed for MVP @see https://github.com/beyondessential/tupaia-backlog/issues/1117 */}
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
  user: PropTypes.object.isRequired,
};

export const ProfileButton = connect(
  state => ({
    user: getCurrentUser(state),
  }),
  null,
)(ProfileButtonComponent);
