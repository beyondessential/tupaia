import { ajvValidate, ensure, isNullish } from '@tupaia/tsutils';
import { EntityUpdateSchema, QuestionType } from '@tupaia/types';
import { getOffsetForTimezone, getUniqueSurveyQuestionFileName } from '@tupaia/utils';
import { generateId } from '../../utilities';
import { SurveyScreenComponentModel } from '../SurveyScreenComponent';

/**
 * @param {string} dateString
 * @param {string} timezone
 * @returns {string}
 */
function appendTimezoneToDateString(dateString, timezone) {
  const timezoneOffset = getOffsetForTimezone(timezone, new Date(dateString));
  return `${dateString}${timezoneOffset}`;
}

/**
 * @param {import('../../ModelRegistry').ModelRegistry} models
 * @param {import('@tupaia/types').SurveyScreenComponentConfig} config
 * @param {import('@tupaia/types').Question['id']} questionId
 * @param {import('@tupaia/types').DatatrakWebSubmitSurveyResponseRequest.ReqBody['answers']} answers
 * @param {import('@tupaia/types').Entity['id']} countryId
 */
async function buildUpsertEntity(models, config, questionId, answers, countryId) {
  const entityId = answers[questionId] || generateId();
  if (typeof entityId !== 'string') {
    throw new Error(`Entity ID must be a string, but received ${entityId}`);
  }

  const entity = { id: entityId };

  const fields = config?.entity?.fields;
  if (fields) {
    for (const [fieldName, value] of Object.entries(fields)) {
      if (value === undefined) return;

      const fieldValue =
        typeof value?.questionId === 'string' // Is question value
          ? answers[value.questionId]
          : value;

      if (fieldName === 'parentId') {
        // If the parentId field is not answered, use the country id
        const parentValue = fieldValue || countryId;
        if (typeof parentValue !== 'string') {
          throw new Error(
            `Parent ID must be a 'string', but got '${typeof parentValue}' (${parentValue})`,
          );
        }
        const entityRecord = ensure(
          await models.entity.findById(parentValue),
          `No entity exists with ID ${parentValue}`,
        );
        entity.parent_id = entityRecord.id;
      } else {
        entity[fieldName] = fieldValue;
      }
    }
  }

  const isUpdate = (await models.entity.count({ id: entityId })) > 0;
  if (isUpdate) return entity;

  const selectedCountry = ensure(
    await models.entity.findById(countryId),
    `No entity exists with ID ${countryId}`,
  );
  entity.country_code ??= selectedCountry.code;
  entity.parent_id ??= selectedCountry.id;
  entity.code ??= entityId;

  return ajvValidate(EntityUpdateSchema, entity);
}

export async function processSurveyResponse(models, surveyResponseData) {
  const {
    answers = {},
    countryId,
    dataTime,
    entityId,
    questions = [],
    startTime,
    surveyId,
    timezone,
    userId,
  } = surveyResponseData;
  const timestamp = new Date().toISOString();

  /**
   * Fields to be used in the survey response
   * @typedef {import('@tupaia/types').Entity} Entity
   * @type {import('@tupaia/types').MeditrakSurveyResponseRequest & { qr_codes_to_create: Entity[]; recent_entities: Entity['id'][] }}
   */
  const surveyResponse = {
    user_id: userId,
    survey_id: surveyId,
    entity_id: countryId,
    start_time: startTime,
    end_time: timestamp,
    data_time: dataTime ? appendTimezoneToDateString(dataTime, timezone) : timestamp,
    timestamp,
    timezone,
    answers: [],
    entities_upserted: [],
    options_created: [],
    qr_codes_to_create: [],
    recent_entities: [],
  };
  // If there is an entity ID in the survey response data, add it to the survey response. This
  // happens in resubmissions.
  if (entityId) surveyResponse.entity_id = entityId;

  // Process answers and save the response in the database
  /** @type {import('@tupaia/types').DatatrakWebSubmitSurveyResponseRequest.UserAnswer[]} */
  const answersToSubmit = [];

  for (const question of questions) {
    const { code: questionCode, config, optionSetId, questionId, type } = question;

    /** @type {import('@tupaia/types').DatatrakWebSubmitSurveyResponseRequest.Answer | import('@tupaia/types').Entity} */
    let answer = answers[questionId];

    if ([QuestionType.PrimaryEntity, QuestionType.Entity].includes(type)) {
      // If an entity should be created by this question, build the entity object. We need to do this before we get to the check for the answer being empty, because most of the time these questions are hidden and therefore the answer will always be empty
      if (SurveyScreenComponentModel.isUpsertEntityQuestion(config)) {
        /** @type {import('@tupaia/types').Entity} */
        const entityObj = await buildUpsertEntity(models, config, questionId, answers, countryId);
        if (entityObj) surveyResponse.entities_upserted.push(entityObj);
        answer = entityObj?.id;
        if (config.entity?.generateQrCode) surveyResponse.qr_codes_to_create.push(entityObj);
      }

      if (type === QuestionType.PrimaryEntity && !answer) {
        throw new Error('Primary Entity question is a required field');
      }

      if (answer) {
        if (typeof answer !== 'string') {
          throw new Error(
            `Unexpected data type for ${type} answer: expected 'string' but got '${typeof answer}'`,
          );
        }
        surveyResponse.recent_entities.push(answer);
      }
    }

    if (isNullish(answer) || answer === '') continue;

    // Base answer object to be added to the answer array
    const answerObject = {
      question_id: questionId,
      type: type,
      body: answer,
    };

    // Handle special question types
    switch (type) {
      case QuestionType.DateOfData:
      case QuestionType.SubmissionDate: {
        // Add timezone offset to date string so it saves in the correct timezone
        surveyResponse.data_time = appendTimezoneToDateString(answer, timezone);
        break;
      }

      case QuestionType.Date:
      case QuestionType.DateTime: {
        // Add timezone offset to date string so it saves in the correct timezone
        if (answer) {
          const body = appendTimezoneToDateString(answer, timezone);
          answersToSubmit.push({ ...answerObject, body });
        }
        break;
      }

      case QuestionType.PrimaryEntity: {
        // Add entity ID to response
        /** @type {import('@tupaia/types').Entity['id']} */
        surveyResponse.entity_id = answer;
        break;
      }

      case QuestionType.User: {
        answersToSubmit.push({
          ...answerObject,
          /** @type {import('@tupaia/types').UserAccount['id']} */
          body: answer.id,
        });
        break;
      }

      case QuestionType.File: {
        /** @type {import('@tupaia/types').DatatrakWebSubmitSurveyResponseRequest.FileUploadAnswer} */
        const { name, value } = answer;
        const isBase64 = value.startsWith('data:');
        const body = isBase64
          ? { data: value, uniqueFileName: getUniqueSurveyQuestionFileName(name) }
          : // If the file isn’t Base64-encoded, save as-is, as this means it’s a file that was
            // uploaded already (i.e. this is a resubmission)
            value;
        answersToSubmit.push({ ...answerObject, body });
        break;
      }

      case QuestionType.Autocomplete: {
        if (!optionSetId) {
          throw new Error(
            `${QuestionType.Autocomplete} question ${questionCode} does not have an optionSetId`,
          );
        }
        if (typeof answer !== 'string') {
          throw new Error(
            `${QuestionType.Autocomplete} answers must be primitive 'string', but got '${typeof answer}' (${answer})`,
          );
        }

        // If the answer is a new option, add it to the `options_created` array to be added to the DB
        const isNew =
          (await models.option.count({ option_set_id: optionSetId, value: answer })) === 0;
        if (isNew) {
          if (!config.autocomplete?.createNew) {
            throw new Error(`Cannot create new options for question: ${questionCode}`);
          }
          surveyResponse.options_created.push({
            option_set_id: optionSetId,
            value: answer,
            label: answer,
          });
        }
        answersToSubmit.push({ ...answerObject, body: answer });
        break;
      }

      default:
        answersToSubmit.push(answerObject);
        break;
    }
  }

  return {
    ...surveyResponse,
    /** @type {import('@tupaia/types').MeditrakSurveyResponseRequest['answers']} */
    answers: answersToSubmit,
  };
}
