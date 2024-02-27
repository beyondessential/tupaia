/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import { getUniqueSurveyQuestionFileName } from '@tupaia/utils';
import {
  DatatrakWebSubmitSurveyRequest,
  Entity,
  MeditrakSurveyResponseRequest,
  QuestionType,
  SurveyScreenComponentConfig,
} from '@tupaia/types';
import { buildUpsertEntity } from './buildUpsertEntity';
import { DatatrakWebServerModelRegistry } from '../../types';

type SurveyRequestT = DatatrakWebSubmitSurveyRequest.ReqBody;
type CentralServerSurveyResponseT = MeditrakSurveyResponseRequest & {
  qr_codes_to_create?: Entity[];
  recent_entities: string[];
};
type AnswerT = DatatrakWebSubmitSurveyRequest.Answer;
type FileUploadAnswerT = DatatrakWebSubmitSurveyRequest.FileUploadAnswer;

export const isUpsertEntityQuestion = (config?: SurveyScreenComponentConfig) => {
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
  models: DatatrakWebServerModelRegistry,
  surveyResponseData: SurveyRequestT,
) => {
  const {
    surveyId,
    countryId,
    questions = [],
    answers = {},
    startTime,
    userId,
    timezone,
  } = surveyResponseData;

  const today = new Date();
  const timestamp = today.toISOString();
  // Fields to be used in the survey response
  const surveyResponse: CentralServerSurveyResponseT = {
    user_id: userId,
    survey_id: surveyId,
    start_time: startTime,
    entity_id: countryId,
    end_time: timestamp,
    data_time: timestamp,
    timestamp,
    timezone,
    entities_upserted: [],
    qr_codes_to_create: [],
    recent_entities: [],
    options_created: [],
    answers: [],
  };
  // Process answers and save the response in the database
  const answersToSubmit = [] as Record<string, unknown>[];

  for (const question of questions) {
    const { questionId, code: questionCode, type, optionSetId } = question;
    let answer = answers[questionId] as AnswerT | Entity;
    const config = question?.config as SurveyScreenComponentConfig;

    if ([QuestionType.PrimaryEntity, QuestionType.Entity].includes(type)) {
      // If an entity should be created by this question, build the entity object. We need to do this before we get to the check for the answer being empty, because most of the time these questions are hidden and therefore the answer will always be empty
      if (isUpsertEntityQuestion(config)) {
        const entityObj = (await buildUpsertEntity(
          models,
          config,
          questionId,
          answers,
          countryId,
        )) as Entity;
        if (entityObj) surveyResponse.entities_upserted?.push(entityObj);
        answer = entityObj?.id;
        if (config.entity?.generateQrCode) {
          surveyResponse.qr_codes_to_create?.push(entityObj);
        }
      }
      surveyResponse.recent_entities.push(answer as string);
    }
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
    switch (type) {
      // format dates to be ISO strings
      case QuestionType.SubmissionDate:
      case QuestionType.DateOfData: {
        const date = new Date(answer as string);
        surveyResponse.data_time = date.toISOString();
        break;
      }

      // add the entity id to the response if the question is a primary entity question
      case QuestionType.PrimaryEntity: {
        const entityId = answer as string;
        surveyResponse.entity_id = entityId;
        break;
      }
      case QuestionType.File: {
        const { name, value } = answer as FileUploadAnswerT;
        answersToSubmit.push({
          ...answerObject,
          body: {
            data: value,
            uniqueFileName: getUniqueSurveyQuestionFileName(name),
          },
        });
        break;
      }
      case QuestionType.Autocomplete: {
        if (!optionSetId) {
          throw new Error(`Autocomplete question ${questionCode} does not have an optionSetId`);
        }

        if (typeof answer !== 'string') {
          throw new Error(`Autocomplete answers must be a plain string value, got: ${answer}`);
        }

        const isNew = (await models.option.findOne({ option_set_id: optionSetId, value: answer }))
          ? false
          : true;

        // if the answer is a new option, add it to the options_created array to be added to the DB
        if (isNew) {
          if (!config.autocomplete?.createNew) {
            throw new Error(`Cannot create new options for question: ${questionCode}`);
          }

          surveyResponse.options_created!.push({
            option_set_id: optionSetId,
            value: answer,
            label: answer,
          });
        }
        answersToSubmit.push({
          ...answerObject,
          body: answer,
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
