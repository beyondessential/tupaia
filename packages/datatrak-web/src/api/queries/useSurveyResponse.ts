/*
 * Tupaia
 *  Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import { useQuery } from 'react-query';
import { useNavigate } from 'react-router';
import { DatatrakWebSingleSurveyResponseRequest } from '@tupaia/types';
import { get } from '../api';
import { ROUTES } from '../../constants';
import { errorToast } from '../../utils';
import { useSurveyForm } from '../../features';

export const useSurveyResponse = (surveyResponseId?: string) => {
  const { setFormData } = useSurveyForm();
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
      onSuccess: data => {
        // handle updating answers here - if this is done in the component, the answers get reset on every re-render
        const formattedAnswers = Object.entries(data.answers).reduce((acc, [key, value]) => {
          // If the value is a stringified object, parse it
          const isStringifiedObject = typeof value === 'string' && value.startsWith('{');
          return { ...acc, [key]: isStringifiedObject ? JSON.parse(value) : value };
        }, {});
        setFormData(formattedAnswers);
      },
    },
  );
};
