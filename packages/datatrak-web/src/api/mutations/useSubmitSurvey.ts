/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { useMutation, useQueryClient } from 'react-query';
import { generatePath, useNavigate, useParams } from 'react-router';
import { Coconut } from '../../components';
import { post, useCountry, useCurrentUser } from '../../api';
import { ROUTES } from '../../constants';
import { getAllSurveyComponents, useSurveyForm } from '../../features';
import { useSurvey } from '../queries';
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
  const user = useCurrentUser();
  const { surveyCode, countryCode } = useParams();
  const { surveyStartTime, surveyScreens } = useSurveyForm();
  const { data: survey } = useSurvey(surveyCode);
  const { data: country } = useCountry(survey?.project?.code, countryCode);
  return {
    startTime: surveyStartTime,
    surveyId: survey?.id,
    questions: getAllSurveyComponents(surveyScreens), // flattened array of survey questions
    countryId: country?.id,
    userId: user.isLoggedIn ? user.id : null, // Let the server assign the public user if not logged in
  };
};

export const useSubmitSurvey = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const params = useParams();
  const { resetForm } = useSurveyForm();

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
        queryClient.invalidateQueries('surveyResponses');
        queryClient.invalidateQueries('recentSurveys');
        queryClient.invalidateQueries('rewards');
        queryClient.invalidateQueries('leaderboard');
        resetForm();
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
