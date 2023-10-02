/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { useMutation } from 'react-query';
import moment from 'moment';
import { generatePath, useNavigate, useParams } from 'react-router';
import { Coconut } from '../../components';
import { getBrowserTimeZone } from '@tupaia/utils';
import { post } from '../api';
import { Entity, EntityQuestionConfig, Survey, SurveyScreenComponent } from '../../types';
import { ROUTES } from '../../constants';
import { useSurveyForm } from '../../features';
import { useSurvey, useUser } from '../queries';
import { successToast } from '../../utils';

type Answers = Record<string, unknown>;

export const isUpsertEntityQuestion = config => {
  if (!config?.entity) {
    return false;
  }
  if (config.entity.createNew) {
    return true;
  }
  return config.entity.fields && Object.keys(config.entity.fields).length > 0;
};

type EntityUpsert = {
  questionId: string;
  config: EntityQuestionConfig;
};

type SurveyResponseData = {
  surveyId?: Survey['id'];
  countryId?: Entity['id'];
  questions?: SurveyScreenComponent[];
  answers?: Answers;
  surveyStartTime?: string;
};

type SurveyResponse = {
  survey_id: Survey['id'];
  start_time: string;
  data_time: string;
  entity_id: Entity['id'];
  timestamp: string;
  timezone: string;
  entities_upserted: EntityUpsert[];
};

// Process the survey response data into the format expected by the endpoint
export const processSurveyResponse = ({
  surveyId,
  countryId,
  questions = [],
  answers = {},
  surveyStartTime,
}: SurveyResponseData) => {
  const timezone = getBrowserTimeZone();
  const timestamp = moment().toISOString();
  // Fields to be used in the survey response
  const surveyResponse = {
    survey_id: surveyId,
    start_time: surveyStartTime,
    entity_id: countryId,
    data_time: timestamp,
    timestamp,
    timezone,
    entities_upserted: [],
  } as SurveyResponse;
  // Process answers and save the response in the database
  const answersToSubmit = [] as Record<string, unknown>[];

  for (const question of questions) {
    const { questionId, questionType, id } = question;
    const answer = answers[questionId];
    if (answer === undefined || answer === null || answer === '') {
      continue;
    }

    // base answer object to be added to the answers array
    const answerObject = {
      id,
      question_id: questionId,
      type: questionType,
      body: answer,
    };

    // Handle special question types
    // TODO: add in photo and file upload handling, as well as adding new entities when these question types are implemented
    switch (questionType) {
      // format dates to be ISO strings
      case 'SubmissionDate':
      case 'DateOfData':
        surveyResponse.data_time = moment(answer).toISOString();
        break;
      // add the entity id to the response if the question is a primary entity question
      case 'PrimaryEntity': {
        surveyResponse.entity_id = answer as string;
        break;
      }
      case 'Entity': {
        if (isUpsertEntityQuestion(question.config)) {
          surveyResponse.entities_upserted.push({
            questionId,
            config: question.config as EntityQuestionConfig,
          });
        }
        answersToSubmit.push(answerObject);
        break;
      }
      default:
        answersToSubmit.push(answerObject);
        break;
    }
  }

  return {
    ...surveyResponse,
    answers: answersToSubmit,
  };
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
    countryId: user?.country?.id,
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

      await post('submitSurvey', {
        data: processedResponse,
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
