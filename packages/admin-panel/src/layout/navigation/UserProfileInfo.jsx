/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { Avatar, Divider, Typography } from '@material-ui/core';
import { Tooltip } from '@tupaia/ui-components';
import { UserLink } from './UserLink';

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

export const UserProfileInfo = ({ user, profileLink, isFullWidth }) => {
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
        <UserLink to={profileLink.to} aria-label={profileLink.label}>
          <Avatar>{initials}</Avatar>
        </UserLink>
      </Tooltip>
    );
  }
  return (
    <Wrapper>
      {name && <UserName>{name}</UserName>}
      <UserEmail>{user.email}</UserEmail>
      <Divider />
      {profileLink && (
        <UserLink key={profileLink.to} to={profileLink.to}>
          {profileLink.label}
        </UserLink>
      )}
      <UserLink to="/logout">Logout</UserLink>
    </Wrapper>
  );
};

UserProfileInfo.propTypes = {
  user: PropTypes.shape({
    email: PropTypes.string.isRequired,
    firstName: PropTypes.string,
    lastName: PropTypes.string,
    profileImage: PropTypes.string,
  }).isRequired,
  profileLink: PropTypes.shape({
    label: PropTypes.string.isRequired,
    to: PropTypes.string.isRequired,
  }),
  isFullWidth: PropTypes.bool.isRequired,
};

UserProfileInfo.defaultProps = {
  profileLink: null,
};
