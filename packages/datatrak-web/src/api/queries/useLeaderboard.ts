/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import { useQuery } from 'react-query';
import { LeaderboardItem } from '@tupaia/types';
import { get } from '../api';

type LeaderboardResponse = {
  items: LeaderboardItem[];
};

export const useLeaderboard = () => {
  return useQuery(['leaderboard'], (): Promise<LeaderboardResponse> => get('leaderboard'));
};
