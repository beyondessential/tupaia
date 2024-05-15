/*
 * Tupaia
 *  Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { useMutation } from 'react-query';
import { generatePath, useNavigate, useParams } from 'react-router';
import { post } from '../api';
import { useSurveyForm } from '../../features';
import { ROUTES } from '../../constants';
import { AnswersT, useSurveyResponseData } from './useSubmitSurveyResponse';

export const useResubmitSurveyResponse = () => {
  const navigate = useNavigate();
  const params = useParams();
  const { surveyResponseId } = params;

  const { resetForm } = useSurveyForm();

  const surveyResponseData = useSurveyResponseData();

  return useMutation<any, Error, AnswersT, unknown>(
    async (answers: AnswersT) => {
      if (!answers) {
        return;
      }

      return post(`surveyResponse/${surveyResponseId}/resubmit`, {
        data: { ...surveyResponseData, answers },
      });
    },
    {
      onSuccess: () => {
        resetForm();
        navigate(generatePath(ROUTES.SURVEY_RESUBMIT_SUCCESS, params));
      },
    },
  );
};
