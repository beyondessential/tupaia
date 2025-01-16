import { useQuery } from '@tanstack/react-query';
import { DatatrakWebSingleSurveyResponseRequest } from '@tupaia/types';
import { get } from '../api';

export const useSurveyResponse = (
  surveyResponseId?: string | null,
  options?: Record<string, unknown> & { enabled?: boolean },
) => {
  return useQuery(
    ['surveyResponse', surveyResponseId],
    (): Promise<DatatrakWebSingleSurveyResponseRequest.ResBody> =>
      get(`surveyResponse/${surveyResponseId}`),
    {
      enabled: !!surveyResponseId && options?.enabled !== false,
      ...options,
    },
  );
};
