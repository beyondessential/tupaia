import { UseQueryOptions, useQuery } from '@tanstack/react-query';
import { DatatrakWebSingleSurveyResponseRequest } from '@tupaia/types';
import { get } from '../api';

export const useSurveyResponse = (
  surveyResponseId?: string | null,
  useQueryOptions?: UseQueryOptions<DatatrakWebSingleSurveyResponseRequest.ResBody>,
) => {
  return useQuery<DatatrakWebSingleSurveyResponseRequest.ResBody>(
    ['surveyResponse', surveyResponseId],
    () => get(`surveyResponse/${surveyResponseId}`),
    {
      ...useQueryOptions,
      enabled: !!surveyResponseId && useQueryOptions?.enabled,
    },
  );
};
