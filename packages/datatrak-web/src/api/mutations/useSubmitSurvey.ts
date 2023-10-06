/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { useMutation } from 'react-query';
import { generatePath, useNavigate, useParams } from 'react-router';
import { Coconut } from '../../components';
import { post } from '../../api';
import { ROUTES } from '../../constants';
import { useSurveyForm } from '../../features';
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
  const { surveyStartTime, surveyScreenComponents } = useSurveyForm();
  const { data: survey } = useSurvey(surveyCode);
  return {
    startTime: surveyStartTime,
    surveyId: survey?.id,
    questions: Object.values(surveyScreenComponents!).reduce((acc, val) => acc.concat(val), []), // flattened array of survey questions
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

      await post('submitSurvey', {
        data: { ...surveyResponseData, answers },
      });
    },
    {
      onSuccess: () => {
        successToast("Congratulations! You've earned a coconut", Coconut);
        navigate(generatePath(ROUTES.SURVEY_SUCCESS, params));
      },
    },
  );
};
