/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { useQuery } from 'react-query';
import { get } from '../api';
import { UserRewards } from '../../types';

export const useUserRewards = () => {
  return useQuery('rewards', (): Promise<UserRewards> => get('me/rewards'));
};
