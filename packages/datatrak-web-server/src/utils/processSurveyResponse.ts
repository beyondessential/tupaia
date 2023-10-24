/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import { getBrowserTimeZone } from '@tupaia/utils';
import moment from 'moment';
import {
  DatatrakWebSubmitSurveyRequest,
  DatatrakWebSurveyRequest,
  Entity,
  MeditrakSurveyResponseRequest,
} from '@tupaia/types';
import { buildUpsertEntity } from './buildUpsertEntity';

type ConfigT = DatatrakWebSurveyRequest.SurveyScreenComponentConfig;
type SurveyRequestT = DatatrakWebSubmitSurveyRequest.ReqBody;
type AutocompleteAnswerT = DatatrakWebSubmitSurveyRequest.AutocompleteAnswer;

export const isUpsertEntityQuestion = (config?: ConfigT) => {
  if (!config?.entity) {
    return false;
  }
  if (config.entity.createNew) {
    return true;
  }
  return config.entity.fields && Object.keys(config.entity.fields).length > 0;
};

// Process the survey response data into the format expected by the endpoint
export const processSurveyResponse = async (
  surveyResponseData: SurveyRequestT,
  findEntityById: (id: string) => Promise<Entity>,
) => {
  const {
    userId,
    surveyId,
    countryId,
    questions = [],
    answers = {},
    startTime,
  } = surveyResponseData;
  const timezone = getBrowserTimeZone();
  const timestamp = moment().toISOString();
  // Fields to be used in the survey response
  const surveyResponse: MeditrakSurveyResponseRequest = {
    user_id: userId,
    survey_id: surveyId,
    start_time: startTime,
    entity_id: countryId,
    country_id: countryId,
    end_time: timestamp,
    data_time: timestamp,
    timestamp,
    timezone,
    entities_upserted: [],
    options_created: [],
    answers: [],
  };
  // Process answers and save the response in the database
  const answersToSubmit = [] as Record<string, unknown>[];

  for (const question of questions) {
    const { questionId, type } = question;
    const answer = answers[questionId];
    if (answer === undefined || answer === null || answer === '') {
      continue;
    }

    // base answer object to be added to the answers array
    const answerObject = {
      question_id: questionId,
      type: type,
      body: answer,
    };

    // Handle special question types
    // TODO: add in photo and file upload handling, as well as adding new entities when these question types are implemented
    switch (type) {
      // format dates to be ISO strings
      case 'SubmissionDate':
      case 'DateOfData':
        surveyResponse.data_time = moment(answer as string).toISOString();
        break;
      // add the entity id to the response if the question is a primary entity question
      case 'PrimaryEntity': {
        surveyResponse.entity_id = answer as string;
        break;
      }
      case 'Entity': {
        const config = question?.config as ConfigT;
        if (isUpsertEntityQuestion(config)) {
          const entityObj = await buildUpsertEntity(
            config,
            questionId,
            answers,
            countryId,
            findEntityById,
          );
          if (entityObj) surveyResponse.entities_upserted!.push(entityObj);
        }
        answersToSubmit.push(answerObject);
        break;
      }
      case 'Autocomplete': {
        // if the answer is a new option, add it to the options_created array to be added to the DB
        const { isNew, value, label, optionSetId } = answer as AutocompleteAnswerT;
        if (isNew) {
          surveyResponse.options_created!.push({
            option_set_id: optionSetId,
            value,
            label,
          });
        }
        answersToSubmit.push({
          ...answerObject,
          body: value,
        });
        break;
      }
      default:
        answersToSubmit.push(answerObject);
        break;
    }
  }

  return {
    ...surveyResponse,
    answers: answersToSubmit as MeditrakSurveyResponseRequest['answers'],
  };
};
