import React from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Avatar, Divider, Typography } from '@material-ui/core';
import { Tooltip } from '@tupaia/ui-components';
import { UserButton } from './UserButton';
import { useUser } from '../../api/queries';
import { useLogout } from '../../api/mutations';
import { logout as logoutAction } from '../../authentication';

const Wrapper = styled.div`
  padding-inline: 1.25rem;
  display: flex;
  flex-direction: column;
`;

const UserName = styled(Typography)`
  font-weight: ${props => props.theme.typography.fontWeightMedium};
  font-size: 0.875rem;
`;

const UserEmail = styled(Typography)`
  font-size: 0.6875rem;
  margin-block-start: 0.25rem;
  margin-block-end: 0.9rem;
`;

const UserProfileInfoComponent = ({ profileLink, isFullWidth, onLogout }) => {
  const { isLoggedIn, data: user, isLoading } = useUser();
  const { mutate: logout } = useLogout(onLogout);

  if (isLoading) return null;

  if (!user) return null;

  const name = user.firstName || user.lastName ? `${user.firstName} ${user.lastName}` : null;

  // If the navbar is collapsed and profileLink is not provided, we don't need to render anything
  if (!isFullWidth && !profileLink) return null;

  // If the navbar is collapsed and profileLink is provided, we render the user's initials as an avatar with a tooltip and a link to the profile
  if (!isFullWidth) {
    const initials = `${user.firstName ? user.firstName[0] : ''}${
      user.lastName ? user.lastName[0] : ''
    }`;
    return (
      <Tooltip title={profileLink.label}>
        <UserButton to={profileLink.to} aria-label={profileLink.label} as={Link}>
          <Avatar>{initials}</Avatar>
        </UserButton>
      </Tooltip>
    );
  }
  return (
    <Wrapper>
      {name && <UserName>{name}</UserName>}
      <UserEmail>{user.email}</UserEmail>
      <Divider />
      {profileLink && (
        <UserButton key={profileLink.to} to={profileLink.to} component={Link}>
          {profileLink.label}
        </UserButton>
      )}
      {isLoggedIn && <UserButton onClick={logout}>Log out</UserButton>}
    </Wrapper>
  );
};

UserProfileInfoComponent.propTypes = {
  profileLink: PropTypes.shape({
    label: PropTypes.string.isRequired,
    to: PropTypes.string.isRequired,
  }),
  isFullWidth: PropTypes.bool.isRequired,
  onLogout: PropTypes.func.isRequired,
};

UserProfileInfoComponent.defaultProps = {
  profileLink: null,
};

const mapDispatchToProps = dispatch => ({
  onLogout: () => dispatch(logoutAction()),
});

export const UserProfileInfo = connect(null, mapDispatchToProps)(UserProfileInfoComponent);
