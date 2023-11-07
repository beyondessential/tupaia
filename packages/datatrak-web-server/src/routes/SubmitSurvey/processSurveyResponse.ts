/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import { getBrowserTimeZone, getUniqueSurveyQuestionFileName } from '@tupaia/utils';
import {
  DatatrakWebSubmitSurveyRequest,
  Entity,
  MeditrakSurveyResponseRequest,
  QuestionType,
  SurveyScreenComponentConfig,
} from '@tupaia/types';
import { buildUpsertEntity } from './buildUpsertEntity';

type SurveyRequestT = DatatrakWebSubmitSurveyRequest.ReqBody;
type AnswerT = DatatrakWebSubmitSurveyRequest.Answer;
type AutocompleteAnswerT = DatatrakWebSubmitSurveyRequest.AutocompleteAnswer;
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
  const today = new Date();
  const timestamp = today.toISOString();
  // Fields to be used in the survey response
  const surveyResponse: MeditrakSurveyResponseRequest & {
    qr_codes_to_create?: Entity[];
  } = {
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
    qr_codes_to_create: [],
    options_created: [],
    answers: [],
  };
  // Process answers and save the response in the database
  const answersToSubmit = [] as Record<string, unknown>[];

  for (const question of questions) {
    const { questionId, type } = question;
    let answer = answers[questionId] as AnswerT | Entity;
    const config = question?.config as SurveyScreenComponentConfig;

    // If the question is an entity question and an entity should be created by this question, build the entity object. We need to do this before we get to the check for the answer being empty, because most of the time these questions are hidden and therefore the answer will always be empty
    if (
      [QuestionType.PrimaryEntity, QuestionType.Entity].includes(type) &&
      isUpsertEntityQuestion(config)
    ) {
      const entityObj = (await buildUpsertEntity(
        config,
        questionId,
        answers,
        countryId,
        findEntityById,
      )) as Entity;
      if (entityObj) surveyResponse.entities_upserted?.push(entityObj);
      answer = entityObj?.id;
      if (config.entity?.generateQrCode) {
        surveyResponse.qr_codes_to_create?.push(entityObj);
      }
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
