/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { useMutation, useQueryClient } from 'react-query';
import { generatePath, useNavigate, useParams } from 'react-router';
import { getBrowserTimeZone } from '@tupaia/utils';
import { QuestionType } from '@tupaia/types';
import { Coconut } from '../../components';
import { post, useCurrentUserContext, useEntityByCode } from '..';
import { ROUTES } from '../../constants';
import { getAllSurveyComponents, useSurveyForm } from '../../features';
import { useSurvey } from '../queries';
import { gaEvent, successToast } from '../../utils';

type Base64 = string | null | ArrayBuffer;

type FileAnswerT = {
  name: string;
  value?: Base64 | File;
};

type Answer = string | number | boolean | null | undefined | FileAnswerT;

export type AnswersT = Record<string, Answer>;

// utility hook for getting survey response data
export const useSurveyResponseData = () => {
  const user = useCurrentUserContext();
  const { surveyCode, countryCode } = useParams();
  const { surveyStartTime, surveyScreens } = useSurveyForm();
  const { data: survey } = useSurvey(surveyCode);
  const { data: country } = useEntityByCode(countryCode!);
  const timezone = getBrowserTimeZone();
  return {
    startTime: surveyStartTime,
    surveyId: survey?.id,
    questions: getAllSurveyComponents(surveyScreens), // flattened array of survey questions
    countryId: country?.id,
    userId: user.isLoggedIn ? user.id : null, // Let the server assign the public user if not logged in
    timezone,
  };
};

export const isFileUploadAnswer = (answer: Answer): answer is FileAnswerT => {
  if (!answer || typeof answer !== 'object') return false;
  return 'value' in answer;
};

const createEncodedFile = (fileObject?: File): Promise<Base64> => {
  if (!fileObject) {
    return Promise.resolve(null);
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      resolve(reader.result);
    };

    reader.onerror = reject;

    reader.readAsDataURL(fileObject);
  });
};

const processAnswers = async (answers: AnswersT, questionsById) => {
  const formattedAnswers = { ...answers };
  for (const [questionId, answer] of Object.entries(answers)) {
    const question = questionsById[questionId];
    if (!question) continue;
    if (question.type === QuestionType.File && isFileUploadAnswer(answer)) {
      // convert to an object with an encoded file so that it can be handled in the backend and uploaded to s3
      const encodedFile = await createEncodedFile(answer.value as File);

      formattedAnswers[questionId] = {
        name: answer.name,
        value: encodedFile,
      };
    }
  }
  return formattedAnswers;
};

export const useSubmitSurveyResponse = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const params = useParams();
  const { resetForm } = useSurveyForm();
  const user = useCurrentUserContext();
  const { data: survey } = useSurvey(params.surveyCode);

  const surveyResponseData = useSurveyResponseData();

  const questionsById = surveyResponseData.questions.reduce((acc, question) => {
    acc[question.questionId] = question;
    return acc;
  }, {});

  return useMutation<any, Error, AnswersT, unknown>(
    async (answers: AnswersT) => {
      if (!answers) {
        return;
      }
      const formattedAnswers = await processAnswers(answers, questionsById);

      return post('submitSurveyResponse', {
        data: { ...surveyResponseData, answers: formattedAnswers },
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
        queryClient.invalidateQueries('entityDescendants'); // Refresh recent entities

        const createNewAutocompleteQuestions = surveyResponseData?.questions?.filter(
          question => question?.config?.autocomplete?.createNew,
        );

        // invalidate optionSet queries for questions that have createNew enabled so that the new options are fetched
        if (createNewAutocompleteQuestions?.length > 0) {
          createNewAutocompleteQuestions.forEach(question => {
            const { optionSetId } = question;
            queryClient.invalidateQueries(['autocompleteOptions', optionSetId]);
          });
        }
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
