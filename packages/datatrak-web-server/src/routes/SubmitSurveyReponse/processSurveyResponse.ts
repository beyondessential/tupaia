import {
  getUniqueSurveyQuestionFileName,
  formatDateInTimezone,
  getOffsetForTimezone,
} from '@tupaia/utils';
import {
  DatatrakWebResubmitSurveyResponseRequest,
  DatatrakWebSubmitSurveyResponseRequest,
  Entity,
  MeditrakSurveyResponseRequest,
  QuestionType,
  SurveyScreenComponentConfig,
} from '@tupaia/types';
import { DatatrakWebServerModelRegistry } from '../../types';
import { buildUpsertEntity } from './buildUpsertEntity';

type SurveyRequestT =
  | DatatrakWebSubmitSurveyResponseRequest.ReqBody
  | DatatrakWebResubmitSurveyResponseRequest.ReqBody;
type CentralServerSurveyResponseT = MeditrakSurveyResponseRequest & {
  qr_codes_to_create?: Entity[];
  recent_entities: string[];
};
type AnswerT = DatatrakWebSubmitSurveyResponseRequest.Answer;
type FileUploadAnswerT = DatatrakWebSubmitSurveyResponseRequest.FileUploadAnswer;
type UserAnswerT = DatatrakWebSubmitSurveyResponseRequest.UserAnswer;

export const isUpsertEntityQuestion = (config?: SurveyScreenComponentConfig) => {
  if (!config?.entity) {
    return false;
  }
  if (config.entity.createNew) {
    return true;
  }
  return config.entity.fields && Object.keys(config.entity.fields).length > 0;
};

const addTimezoneToDateString = (dateString: string, timezone: string) => {
  const timezoneOffset = getOffsetForTimezone(timezone, new Date(dateString));
  return `${dateString}${timezoneOffset}`;
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
    dataTime,
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
    data_time: dataTime ? addTimezoneToDateString(dataTime, timezone) : timestamp,
    timestamp,
    timezone,
    entities_upserted: [],
    qr_codes_to_create: [],
    recent_entities: [],
    options_created: [],
    answers: [],
  };
  // if there is an entityId in the survey response data, add it to the survey response. This will happen in cases of resubmission
  if ('entityId' in surveyResponseData && surveyResponseData.entityId) {
    surveyResponse.entity_id = surveyResponseData.entityId;
  }
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
      if (type === QuestionType.PrimaryEntity && !answer) {
        throw new Error(`Primary Entity Question is a required field`);
      }
      if (answer) {
        if (typeof answer !== 'string') {
          throw new Error(
            `Unexpected data type for EntityQuestion answer, expected string but got: ${typeof answer}`,
          );
        }
        surveyResponse.recent_entities.push(answer);
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
      // Add the timezone offset to the date string so it saves in the correct timezone
      case QuestionType.SubmissionDate:
      case QuestionType.DateOfData: {
        surveyResponse.data_time = addTimezoneToDateString(answer as string, timezone);
        break;
      }

      case QuestionType.Date:
      case QuestionType.DateTime: {
        // Add the timezone offset to the date string so it saves in the correct timezone
        if (answer) {
          answersToSubmit.push({
            ...answerObject,
            body: addTimezoneToDateString(answer as string, timezone),
          });
        }
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
        const isBase64 = value.startsWith('data:');
        // if the file is not base64 encoded, save the file as it is, as this means it's a file that was uploaded already, and this is a resubmission
        if (!isBase64) {
          answersToSubmit.push({
            ...answerObject,
            body: value,
          });
          break;
        }
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
      case QuestionType.User: {
        answersToSubmit.push({
          ...answerObject,
          body: (answer as UserAnswerT).id,
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
