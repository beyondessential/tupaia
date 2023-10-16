/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { useMutation } from 'react-query';
import { generatePath, useNavigate, useParams } from 'react-router';
import { Coconut } from '../../components';
import { post } from '../../api';
import { ROUTES } from '../../constants';
import { getAllSurveyComponents, useSurveyForm } from '../../features';
import { useSurvey, useUser } from '../queries';
import { successToast } from '../../utils';

type AutocompleteAnswer = {
  isNew?: boolean;
  optionSetId: string;
  value: string;
  label: string;
};

type Answer = string | number | boolean | null | undefined | AutocompleteAnswer;

export type AnswersT = Record<string, Answer>;

// utility hook for getting survey response data
export const useSurveyResponseData = () => {
  const { data: user } = useUser();
  const { surveyCode } = useParams();
  const { surveyStartTime, surveyScreens } = useSurveyForm();
  const { data: survey } = useSurvey(surveyCode);
  return {
    startTime: surveyStartTime,
    surveyId: survey?.id,
    questions: getAllSurveyComponents(surveyScreens), // flattened array of survey questions
    countryId: user?.country?.id,
    userId: user?.id,
  };
};

export const useSubmitSurvey = () => {
  const navigate = useNavigate();
  const params = useParams();

  const surveyResponseData = useSurveyResponseData();

  return useMutation<any, Error, AnswersT, unknown>(
    async (answers: AnswersT) => {
      if (!answers) {
        return;
      }

      return await post('submitSurvey', {
        data: { ...surveyResponseData, answers },
      });
    },
    {
      onSuccess: data => {
        successToast("Congratulations! You've earned a coconut", Coconut);
        // include the survey response data in the location state, so that we can use it to generate QR codes
        navigate(generatePath(ROUTES.SURVEY_SUCCESS, params), {
          state: {
            surveyResponse: JSON.stringify(data),
          },
        });
      },
    },
  );
};
