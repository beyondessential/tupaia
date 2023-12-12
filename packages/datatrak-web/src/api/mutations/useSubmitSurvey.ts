/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { useMutation, useQueryClient } from 'react-query';
import { generatePath, useNavigate, useParams } from 'react-router';
import { Coconut } from '../../components';
import { post, useCurrentUser, useEntityByCode } from '../../api';
import { ROUTES } from '../../constants';
import { getAllSurveyComponents, useSurveyForm } from '../../features';
import { useSurvey } from '../queries';
import { gaEvent, successToast } from '../../utils';

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
  const { data: country } = useEntityByCode(countryCode!);
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
  const user = useCurrentUser();
  const { data: survey } = useSurvey(params.surveyCode);

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
      onMutate: () => {
        // Send off survey submissions by survey, project, country, and userId
        gaEvent('submit_survey', params.surveyCode!, survey?.name);
        gaEvent('submit_survey_by_project', user.project?.code!);
        gaEvent('submit_survey_by_country', params.countryCode!);
        gaEvent('submit_survey_by_user', user.id!);
      },
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
