/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import { useQuery } from 'react-query';
import { DatatrakWebSurveyResponsesRequest } from '@tupaia/types';
import { useUser } from './useUser';
import { get } from '../api';

export const useSurveyResponses = (userId?: string) => {
  return useQuery(
    ['surveyResponses', userId],
    (): Promise<DatatrakWebSurveyResponsesRequest.ResBody> =>
      get('surveyResponses', { params: { userId } }),
    { enabled: !!userId },
  );
};

export const useCurrentUserSurveyResponses = () => {
  const { data: user } = useUser();
  return useSurveyResponses(user.id);
};
