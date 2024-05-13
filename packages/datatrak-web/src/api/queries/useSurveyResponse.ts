/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import { useQuery } from 'react-query';
import { useNavigate } from 'react-router';
import { DatatrakWebSingleSurveyResponseRequest } from '@tupaia/types';
import { get } from '../api';
import { ROUTES } from '../../constants';
import { errorToast } from '../../utils';

export const useSurveyResponse = (surveyResponseId?: string) => {
  const navigate = useNavigate();
  return useQuery(
    ['surveyResponse', surveyResponseId],
    (): Promise<DatatrakWebSingleSurveyResponseRequest.ResBody> =>
      get(`surveyResponse/${surveyResponseId}`),
    {
      enabled: !!surveyResponseId,
      meta: {
        applyCustomErrorHandling: true,
      },
      onError(error: any) {
        if (error.code === 403)
          return navigate(ROUTES.NOT_AUTHORISED, { state: { errorMessage: error.message } });
        errorToast(error.message);
      },
    },
  );
};
