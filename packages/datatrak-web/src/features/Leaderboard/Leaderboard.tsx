/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { useUserRewards } from '../../api/queries';
import { UserRewardsSection } from './UserRewardsSection';
import { LeaderboardTable } from './LeaderboardTable';

const ScrollBody = styled.div`
  overflow: auto;
  background: ${({ theme }) => theme.palette.background.paper};
  border-radius: 10px;
  max-height: 100%;

  ${({ theme }) => theme.breakpoints.down('md')} {
    flex: 1;
  }
`;

export const Leaderboard = () => {
  const { data: userRewards, isSuccess } = useUserRewards();
  return (
    <ScrollBody>
      {isSuccess && <UserRewardsSection pigs={userRewards.pigs} coconuts={userRewards.coconuts} />}
      <LeaderboardTable userRewards={userRewards} />
    </ScrollBody>
  );
};
