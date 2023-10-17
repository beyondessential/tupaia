/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import { useQuery } from 'react-query';
import { DatatrakWebEntitiesRequest } from '@tupaia/types';
import { useUser } from './useUser';
import { get } from '../api';

export const useSurveyResponses = (userId?: string) => {
  return useQuery(
    ['surveyResponses', userId],
    (): Promise<DatatrakWebEntitiesRequest.ResBody> =>
      get('surveyResponses', { params: { userId } }),
    { enabled: !!userId },
  );
};

export const useCurrentUserSurveyResponses = () => {
  const { data: user } = useUser();
  return useSurveyResponses(user.id);
};
