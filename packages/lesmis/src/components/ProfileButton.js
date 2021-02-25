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

  const handleLogout = async () => {
    await get('logout');
    queryClient.invalidateQueries('user');
  };

  return (
    <StyledProfileButton
      user={{ ...user, name: `${user.firstName} ${user.lastName}` }}
      MenuOptions={() => (
        <ProfileButtonItem button onClick={handleLogout}>
          Logout
        </ProfileButtonItem>
      )}
    />
  );
};
