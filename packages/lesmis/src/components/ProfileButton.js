/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import React from 'react';
import styled from 'styled-components';
import { useQueryClient } from 'react-query';
import { ProfileButton as BaseProfileButton, ProfileButtonItem } from '@tupaia/ui-components';
import { get, useUser } from '../api';

const StyledProfileButton = styled(BaseProfileButton)`
  background: rgba(0, 0, 0, 0.2);

  &:hover {
    background: rgba(0, 0, 0, 0.2);
  }
`;

export const ProfileButton = () => {
  const { data: user } = useUser();
  const queryClient = useQueryClient();

  const handleLogout = () =>
    get('logout').then(() => {
      queryClient.invalidateQueries('getUser');
    });

  return (
    <StyledProfileButton
      user={user}
      MenuOptions={() => (
        <ProfileButtonItem button onClick={handleLogout}>
          Logout
        </ProfileButtonItem>
      )}
    />
  );
};
