/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import { useQuery } from 'react-query';
import { DatatrakWebRecentSurveysRequest } from '@tupaia/types';
import { useUser } from './useUser';
import { get } from '../api';

export const useRecentSurveys = (userId?: string) => {
  return useQuery(
    ['recentSurveys', userId],
    (): Promise<DatatrakWebRecentSurveysRequest.ResBody> =>
      get('recentSurveys', { params: { userId } }),
    { enabled: !!userId },
  );
};

export const useCurrentUserRecentSurveys = () => {
  const { data: user } = useUser();
  return useRecentSurveys(user.id);
};
