/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { useCurrentUser } from '../../api';
import { useLeaderboard, useUserRewards } from '../../api/queries';
import { UserRewardsSection } from './UserRewardsSection';
import { LeaderboardTable } from './LeaderboardTable';

const ScrollBody = styled.div`
  overflow: auto;
  background: ${({ theme }) => theme.palette.background.paper};
  border-radius: 10px;
  max-height: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  ${({ theme }) => theme.breakpoints.down('md')} {
    flex: 1;
  }
`;

export const Leaderboard = () => {
  const user = useCurrentUser();
  const { data: userRewards, isSuccess } = useUserRewards();
  const { data: leaderboard } = useLeaderboard(user.projectId);

  return (
    <ScrollBody>
      {isSuccess && <UserRewardsSection pigs={userRewards.pigs} coconuts={userRewards.coconuts} />}
      <LeaderboardTable userRewards={userRewards} leaderboard={leaderboard} user={user} />
    </ScrollBody>
  );
};
