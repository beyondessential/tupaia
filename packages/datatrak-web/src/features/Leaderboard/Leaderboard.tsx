/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { useCurrentUserContext } from '../../api';
import { useLeaderboard, useUserRewards } from '../../api/queries';
import { UserRewardsSection } from './UserRewardsSection';
import { LeaderboardTable } from './LeaderboardTable';
import { useMediaQuery } from '@material-ui/core';
import { useTheme } from '@material-ui/core';

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
  const user = useCurrentUserContext();
  const { data: userRewards, isSuccess } = useUserRewards();
  const { data: leaderboard } = useLeaderboard(user.projectId);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  let leaderboardList = leaderboard ?? [];

  if (isMobile && leaderboard) {
    leaderboardList = leaderboard.slice(0, 5);
  }

  return (
    <ScrollBody>
      {isSuccess && <UserRewardsSection pigs={userRewards.pigs} coconuts={userRewards.coconuts} />}
      <LeaderboardTable userRewards={userRewards} leaderboard={leaderboardList} user={user} />
    </ScrollBody>
  );
};
