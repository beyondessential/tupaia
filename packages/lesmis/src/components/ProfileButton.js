/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import React from 'react';
import styled from 'styled-components';
import { Link as RouterLink } from 'react-router-dom';
import MuiButton from '@material-ui/core/Button';
import { ProfileButton as BaseProfileButton, ProfileButtonItem } from '@tupaia/ui-components';
import { useUser, useLogout } from '../api';

const StyledProfileButton = styled(BaseProfileButton)`
  background: rgba(0, 0, 0, 0.2);

  &:hover {
    background: rgba(0, 0, 0, 0.2);
  }
`;

const ProfileLinks = () => {
  const { mutate: handleLogout } = useLogout();
  return (
    <ProfileButtonItem button onClick={handleLogout}>
      Logout
    </ProfileButtonItem>
  );
};

const LoginLink = styled(MuiButton)`
  color: white;
  border-color: white;
  padding: 0.5rem 2rem;
  border-radius: 2.5rem;
`;

export const ProfileButton = () => {
  const { data: user, isLoggedIn } = useUser();
  return user && isLoggedIn ? (
    <StyledProfileButton
      user={{ ...user, name: `${user.firstName} ${user.lastName}` }}
      MenuOptions={ProfileLinks}
    />
  ) : (
    <LoginLink variant="outlined" component={RouterLink} to="/login">
      Log in
    </LoginLink>
  );
};
