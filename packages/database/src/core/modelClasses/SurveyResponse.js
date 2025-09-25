import { SyncDirections } from '@tupaia/constants';
import { ajvValidate, ensure, isNullish } from '@tupaia/tsutils';
import { EntityUpdateSchema, QuestionType } from '@tupaia/types';
import { getOffsetForTimezone, getUniqueSurveyQuestionFileName } from '@tupaia/utils';
import { DatabaseRecord } from '../DatabaseRecord';
import { MaterializedViewLogDatabaseModel } from '../analytics';
import { createSurveyResponsePermissionFilter } from '../permissions';
import { RECORDS } from '../records';
import { buildSyncLookupSelect } from '../sync';
import { generateId } from '../utilities';
import { SurveyScreenComponentModel } from './SurveyScreenComponent';

const USERS_EXCLUDED_FROM_LEADER_BOARD = [
  "'edmofro@gmail.com'", // Edwin
  "'kahlinda.mahoney@gmail.com'", // Kahlinda
  "'lparish1980@gmail.com'", // Lewis
  "'sus.lake@gmail.com'", // Susie
  "'michaelnunan@hotmail.com'", // Michael
  "'vanbeekandrew@gmail.com'", // Andrew
  "'gerardckelly@gmail.com'", // Gerry K
  "'geoffreyfisher@hotmail.com'", // Geoff F
  "'unicef.laos.edu@gmail.com'", // Laos Schools Data Collector
];
const SYSTEM_USERS = [
  "'tamanu-server@tupaia.org'", // Tamanu Server
  "'public@tupaia.org'", // Public User
  "'josh@sussol.net'", // mSupply API Client
];
const INTERNAL_EMAIL = ['@beyondessential.com.au', '@bes.au'];
const INTERNAL_PROJECT_IDS = [
  '6684ac9d0f018e110b000a00', // bes_asset_demo
  '66a03660718c54751609eeed', // bes_asset_tracker
  '6704622a45a4fc4941071605', // bes_reporting
];

export function getLeaderboard(projectId = '') {
  const isInternalProject = projectId && INTERNAL_PROJECT_IDS.includes(projectId);

  const besUsersFilter = `AND ${INTERNAL_EMAIL.map(email => `email NOT LIKE '%${email}'`).join(' AND ')}`;
  const excludedUserAccountList = isInternalProject
    ? SYSTEM_USERS
    : [...SYSTEM_USERS, ...USERS_EXCLUDED_FROM_LEADER_BOARD];

  return `SELECT r.user_id, user_account.first_name, user_account.last_name, r.coconuts, r.pigs
      FROM (
        SELECT user_id, COUNT(*)::int as coconuts, FLOOR(COUNT(*) / 100)::int as pigs
        FROM survey_response
        JOIN survey on survey.id=survey_id
        ${projectId ? 'WHERE survey.project_id = ?' : ''}
        GROUP BY user_id
      ) r
      JOIN user_account on user_account.id = r.user_id
      WHERE email NOT IN (${excludedUserAccountList.join(',')})
      ${!isInternalProject ? besUsersFilter : ''}
      ORDER BY coconuts DESC
      LIMIT ?;
    `;
}

export class SurveyResponseRecord extends DatabaseRecord {
  static databaseRecord = RECORDS.SURVEY_RESPONSE;

  async getAnswers(conditions = {}) {
    return await this.otherModels.answer.find({ survey_response_id: this.id, ...conditions });
  }
}

export class SurveyResponseModel extends MaterializedViewLogDatabaseModel {
  static syncDirection = SyncDirections.BIDIRECTIONAL;

  /**
   * @param {import('@tupaia/types').DatatrakWebSubmitSurveyResponseRequest.ReqBody | import('@tupaia/types').DatatrakWebResubmitSurveyResponseRequest.ReqBody} surveyResponseData
   */
  static async processSurveyResponse(models, surveyResponseData) {
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

  get DatabaseRecordClass() {
    return SurveyResponseRecord;
  }

  async getLeaderboard(projectId = '', rowCount = 10) {
    const bindings = projectId ? [projectId, rowCount] : [rowCount];
    const query = getLeaderboard(projectId);
    return this.database.executeSql(query, bindings);
  }

  async createRecordsPermissionFilter(accessPolicy, criteria = {}, options = {}) {
    return await createSurveyResponsePermissionFilter(
      accessPolicy,
      this.otherModels,
      criteria,
      options,
    );
  }

  async buildSyncLookupQueryDetails() {
    return {
      select: await buildSyncLookupSelect(this, {
        projectIds: 'array_remove(ARRAY[survey.project_id], NULL)',
      }),
      joins: `
        LEFT JOIN survey
          ON survey.id = survey_response.survey_id
          AND survey_response.outdated IS FALSE -- no outdated survey response
      `,
    };
  }
}

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
 * @param {import('../ModelRegistry').ModelRegistry} models
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

  const isUpdate = await models.entity.findById(entityId);
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
