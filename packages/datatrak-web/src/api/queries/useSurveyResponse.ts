/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import { useQuery } from 'react-query';
import { DatatrakWebRecentSurveyResponseRequest } from '@tupaia/types';
import { get } from '../api';

export const useSurveyResponse = (surveyResponseId?: string) => {
  return useQuery(
    ['surveyResponse', surveyResponseId],
    (): Promise<DatatrakWebRecentSurveyResponseRequest.ResBody> =>
      get(`surveyResponse/${surveyResponseId}`),
    { enabled: !!surveyResponseId },
  );
};
