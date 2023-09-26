/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { useMutation } from 'react-query';
import moment from 'moment';
import { DatatrakWebUserRequest } from '@tupaia/types';
import { getBrowserTimeZone } from '@tupaia/utils';
import { post } from '../api';
import { Survey, SurveyScreenComponent } from '../../types';
import { generatePath, useNavigate, useParams } from 'react-router';
import { ROUTES } from '../../constants';
import { useSurveyForm } from '../../features';
import { useSurvey, useUser } from '../queries';

type Answers = Record<string, unknown>[];

type SurveyResponseData = {
  surveyId?: Survey['id'];
  user?: DatatrakWebUserRequest.ResBody;
  questions?: SurveyScreenComponent[];
  answers?: Answers;
  surveyStartTime: string;
};

export const processSurveyResponse = ({
  surveyId,
  user,
  questions = [],
  answers = [],
  surveyStartTime,
}: SurveyResponseData) => {
  // Fields to be used in the survey response
  const responseFields = {
    survey_id: surveyId,
    start_time: surveyStartTime,
    data_time: moment().toISOString(),
    entity_id: user?.country?.id,
    end_time: moment().toISOString(),
    timestamp: moment().toISOString(),
    timezone: getBrowserTimeZone(),
    entity_code: 'DL', // TODO: remove once country selection is merged in here
    metadata: JSON.stringify({}), // TODO: add location here
  } as Record<string, unknown>;
  // Process answers and save the response in the database
  const answersToSubmit = [] as Record<string, unknown>[];

  for (const question of questions) {
    const { questionId, questionType, id } = question;
    const answer = answers[questionId];
    if (answer === undefined || answer === null || answer === '') {
      continue;
    }

    // Handle special question types
    // TODO: add in photo and file upload handling, as well as adding new entities when these question types are implemented
    switch (questionType) {
      // format dates to be ISO strings
      case 'SubmissionDate':
      case 'DateOfData':
        responseFields.dataTime = moment(answer).toISOString();
        break;
      // add the entity id to the response if the question is a primary entity question
      case 'PrimaryEntity': {
        responseFields.entityId = answer;
        break;
      }
      default:
        answersToSubmit.push({
          id: id,
          question_id: questionId,
          type: questionType,
          body: answer,
        });
        break;
    }
  }

  return { ...responseFields, answers: answersToSubmit };
};

// utility hook for getting survey response data
const useSurveyResponseData = () => {
  const { data: user } = useUser();
  const { surveyCode } = useParams();
  const { surveyStartTime, surveyScreenComponents } = useSurveyForm();
  const { data: survey } = useSurvey(surveyCode);
  return {
    surveyStartTime,
    surveyId: survey?.id,
    questions: Object.values(surveyScreenComponents!).reduce((acc, val) => acc.concat(val), []), // flattened array of survey questions
    user,
  };
};

export const useSubmitSurvey = () => {
  const navigate = useNavigate();
  const params = useParams();

  const surveyResponseData = useSurveyResponseData();

  return useMutation<any, Error, Answers, unknown>(
    async (answers: Answers) => {
      if (!answers) {
        return;
      }

      const processedResponse = processSurveyResponse({
        ...surveyResponseData,
        answers,
      });

      await post('/surveyResponse', {
        data: processedResponse,
      });
    },
    {
      onSuccess: () => {
        navigate(generatePath(ROUTES.SURVEY_SUCCESS, params));
      },
    },
  );
};
