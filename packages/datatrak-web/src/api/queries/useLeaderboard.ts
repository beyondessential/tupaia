/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import { useQuery } from 'react-query';
import { DatatrakWebLeaderboardRequest } from '@tupaia/types';
import { get } from '../api';

export const useLeaderboard = () => {
  return useQuery(
    ['leaderboard'],
    (): Promise<DatatrakWebLeaderboardRequest.ResBody> => get('leaderboard'),
  );
};
