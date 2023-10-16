/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import { useQuery } from 'react-query';
import { DatatrakWebEntitiesRequest } from '@tupaia/types';
import { useUser } from './useUser';
import { get } from '../api';

export const useSurveyResponses = (userId?: string) => {
  const filter = JSON.stringify({ user_id: userId });
  return useQuery(
    ['surveyResponses', userId],
    (): Promise<DatatrakWebEntitiesRequest.ResBody> =>
      get('surveyResponses', { params: { filter } }),
    { enabled: !!userId },
  );
};

export const useCurrentUserSurveyResponses = () => {
  const { data: user } = useUser();
  return useSurveyResponses(user.id);
};
