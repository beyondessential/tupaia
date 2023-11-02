/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { Typography } from '@material-ui/core';
import { DatatrakWebUserRequest } from '@tupaia/types';
import { useUserRewards } from '../../../api/queries';
import { Coconut, Pig } from '../../../components';

const UserContent = styled.div<{
  $appearsDisabled?: boolean;
}>`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  flex: 1;
  .MuiSvgIcon-root {
    &,
    path {
      fill: ${({ theme, $appearsDisabled }) => {
        if ($appearsDisabled) return theme.palette.text.secondary;
      }};
    }
  }
  .MuiTypography-root {
    color: ${({ theme, $appearsDisabled }) => {
      if ($appearsDisabled) return theme.palette.text.secondary;
    }};
  }
`;

const UserName = styled(Typography)`
  font-weight: ${({ theme }) => theme.typography.fontWeightMedium};
`;

const UserRewards = styled.div`
  display: flex;
  padding-bottom: 0.3rem;
  margin-top: 1.5rem;
  ${({ theme }) => theme.breakpoints.up('md')} {
    margin-top: 0;
  }
`;

const UserRewardsItem = styled(Typography)`
  display: flex;
  align-items: center;
  font-size: 0.875rem;
  font-weight: ${({ theme }) => theme.typography.fontWeightMedium};
  .MuiSvgIcon-root {
    margin-right: 0.3rem;
    font-size: 1.25rem;
  }
  & + & {
    margin-left: 1rem;
  }
`;

export const UserDetails = ({ user }: { user?: DatatrakWebUserRequest.ResBody }) => {
  const { deleteAccountRequested } = user || ({} as DatatrakWebUserRequest.ResBody);
  const { data: userRewards } = useUserRewards();
  return (
    <UserContent $appearsDisabled={deleteAccountRequested}>
      <div>
        <UserName>{user?.userName}</UserName>
        <Typography>{user?.email}</Typography>
      </div>
      <UserRewards>
        <UserRewardsItem>
          <Pig /> {userRewards?.pigs} Pigs
        </UserRewardsItem>
        <UserRewardsItem>
          <Coconut /> {userRewards?.coconuts} Coconuts
        </UserRewardsItem>
      </UserRewards>
    </UserContent>
  );
};
