import React from 'react';
import styled from 'styled-components';

import { Skeleton } from '@material-ui/lab';

import { useCurrentUserContext } from '../../api';
import { useLeaderboard, useShowCoconutsPigs, useUserRewards } from '../../api/queries';
import { UserRewardsSection } from './UserRewardsSection';
import { LeaderboardTable } from './LeaderboardTable';
import { useIsMobile } from '../../utils';

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

const UserRewardsSkeleton = styled.div`
  display: flex;
  justify-content: center;
  padding: 0.6rem 2rem;
  border-bottom: max(0.0625rem, 1px) solid ${props => props.theme.palette.divider};
  gap: 2.8rem;
  ${({ theme }) => theme.breakpoints.up('md')} {
    padding: 1.5rem 2.2rem;
  }
`;

export const Leaderboard = () => {
  const user = useCurrentUserContext();
  const { data: userRewards, isSuccess } = useUserRewards();
  const { data: leaderboard = [] } = useLeaderboard(user.projectId);
  const isMobile = useIsMobile();
  const leaderboardList = isMobile ? leaderboard.slice(0, 5) : leaderboard;
  const { showCoconutsPigs, isConfigLoaded } = useShowCoconutsPigs();

  const renderUserRewards = () => {
    if (!isConfigLoaded) {
      return (
        <UserRewardsSkeleton>
          <Skeleton width={100} height={24} />
          <Skeleton width={80} height={24} />
        </UserRewardsSkeleton>
      );
    }
    if (showCoconutsPigs && isSuccess) {
      return <UserRewardsSection pigs={userRewards.pigs} coconuts={userRewards.coconuts} />;
    }
    return null;
  };

  return (
    <ScrollBody>
      {renderUserRewards()}
      <LeaderboardTable userRewards={userRewards} leaderboard={leaderboardList} user={user} />
    </ScrollBody>
  );
};
