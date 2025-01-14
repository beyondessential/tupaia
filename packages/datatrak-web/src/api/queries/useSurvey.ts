import { useQuery } from '@tanstack/react-query';
import { DatatrakWebSurveyRequest } from '@tupaia/types';
import { get } from '../api';

export const useSurvey = (surveyCode?: string) => {
  return useQuery(
    ['survey', surveyCode],
    (): Promise<DatatrakWebSurveyRequest.ResBody> => get(`surveys/${surveyCode}`),
    {
      enabled: !!surveyCode,
      meta: {
        applyCustomErrorHandling: true,
      },
    },
  );
};
