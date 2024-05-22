/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Divider, Typography } from '@material-ui/core';
import { UserLink } from './UserLink';
import { useUser } from '../../api/queries';
import { useLogout } from '../../api/mutations';

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

export const UserProfileInfo = ({ userLinks }) => {
  const { isLoggedIn, data: user, isLoading } = useUser();
  const { mutate: logout } = useLogout();

  if (isLoading) return null;

  const name = user.firstName || user.lastName ? `${user.firstName} ${user.lastName}` : null;
  return (
    <Wrapper>
      {name && <UserName>{name}</UserName>}
      <UserEmail>{user.email}</UserEmail>
      <Divider />
      {userLinks &&
        userLinks.map(({ label, to }) => (
          <UserLink key={to} to={to} component={Link}>
            {label}
          </UserLink>
        ))}

      {isLoggedIn && <UserLink onClick={logout}>Log out</UserLink>}
    </Wrapper>
  );
};

UserProfileInfo.propTypes = {
  userLinks: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      to: PropTypes.string.isRequired,
    }).isRequired,
  ),
};

UserProfileInfo.defaultProps = {
  userLinks: [],
};
