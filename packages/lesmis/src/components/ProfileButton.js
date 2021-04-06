/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import React from 'react';
import styled from 'styled-components';
import { useQueryClient } from 'react-query';
import { ProfileButton as BaseProfileButton, ProfileButtonItem } from '@tupaia/ui-components';
import { LoginDialog } from './LoginDialog';
import { useUser, useLogout } from '../api';

const StyledProfileButton = styled(BaseProfileButton)`
  background: rgba(0, 0, 0, 0.2);

  &:hover {
    background: rgba(0, 0, 0, 0.2);
  }
`;

export const ProfileButton = () => {
  const { data: user, isSuccess } = useUser();
  const queryClient = useQueryClient();
  const { mutate: handleLogout } = useLogout();

  return user && isSuccess ? (
    <StyledProfileButton
      user={{ ...user, name: `${user.firstName} ${user.lastName}` }}
      MenuOptions={() => (
        <ProfileButtonItem button onClick={handleLogout}>
          Logout
        </ProfileButtonItem>
      )}
    />
  ) : (
    <LoginDialog buttonText="Log in" />
  );
};
