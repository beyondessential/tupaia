import { difference, uniq } from 'es-toolkit';
import { flattenDeep, groupBy, keyBy } from 'es-toolkit/compat';
import log from 'winston';

import { SyncDirections } from '@tupaia/constants';
import { ensure, isNullish } from '@tupaia/tsutils';
import { DatabaseError, PermissionsError, reduceToDictionary } from '@tupaia/utils';

import { DatabaseRecord } from '../../DatabaseRecord';
import { MaterializedViewLogDatabaseModel } from '../../analytics';
import { createSurveyResponsePermissionFilter } from '../../permissions';
import { RECORDS } from '../../records';
import { buildSyncLookupSelect } from '../../sync';
import { getLeaderboardQuery } from './leaderboard';
import { processSurveyResponse } from './processSurveyResponse';
import { saveResponsesToDatabase } from './saveToDatabase';
import { upsertAnswers } from './upsertAnswers';
import { upsertEntitiesAndOptions } from './upsertEntitiesAndOptions';
import { validateSurveyResponse, validateSurveyResponses } from './validation';

/**
 * @typedef {import('@tupaia/access-policy').AccessPolicy} AccessPolicy
 * @typedef {import('@tupaia/types').Answer} Answer
 * @typedef {import('@tupaia/types').Country} Country
 * @typedef {import('@tupaia/types').Entity} Entity
 * @typedef {import('@tupaia/types').PermissionGroup} PermissionGroup
 * @typedef {import('@tupaia/types').Project} Project
 * @typedef {import('@tupaia/types').QuestionType} QuestionType
 * @typedef {import('@tupaia/types').Survey} Survey
 * @typedef {import('@tupaia/types').SurveyResponse} SurveyResponse
 * @typedef {import('../../ModelRegistry').ModelRegistry} ModelRegistry
 * @typedef {import('../Country').CountryRecord} CountryRecord
 * @typedef {import('../Entity').EntityRecord} EntityRecord
 * @typedef {import('../Facility').FacilityRecord} FacilityRecord
 * @typedef {import('../PermissionGroup').PermissionGroupRecord} PermissionGroupRecord
 * @typedef {import('../Survey').SurveyRecord} SurveyRecord
 */

export class SurveyResponseRecord extends DatabaseRecord {
  static databaseRecord = RECORDS.SURVEY_RESPONSE;

  async getAnswers(conditions = {}) {
    return await this.otherModels.answer.find({ survey_response_id: this.id, ...conditions });
  }

  /** @returns {Promise<EntityRecord>} */
  async getEntity(conditions) {
    return ensure(
      await this.otherModels.entity.findById(this.entity_id, conditions),
      `Couldn’t find entity for survey response ${this.id} (expected entity with ID ${this.entity_id})`,
    );
  }

  /** @returns {Promise<Entity['id']>} */
  async getEntityId() {
    const { id } = ensure(
      await this.getEntity(this.entity_id, { columns: ['id'] }),
      `Couldn’t find entity for survey response ${this.id} (expected entity with ID ${this.entity_id})`,
    );
    return id;
  }

  /** @returns {Promise<Project['id']>} */
  async getProjectId() {
    const { project_id } = ensure(
      await this.otherModels.survey.findById(this.survey_id, { columns: ['project_id'] }),
      `Couldn’t find survey for survey response ${this.id} (expected survey with ID ${this.survey_id})`,
    );
    return project_id;
  }
}

export class SurveyResponseModel extends MaterializedViewLogDatabaseModel {
  static syncDirection = SyncDirections.BIDIRECTIONAL;

  /**
   * @param {import('@tupaia/types').DatatrakWebSubmitSurveyResponseRequest.ReqBody | import('@tupaia/types').DatatrakWebResubmitSurveyResponseRequest.ReqBody} surveyResponseData
   */
  static async processSurveyResponse(models, surveyResponseData) {
    return await processSurveyResponse(models, surveyResponseData);
  }

  /**
   * @param {Record<QuestionType, AnswerBodyParser> | undefined} [answerBodyParsers]
   */
  static async saveResponsesToDatabase(models, userId, surveyResponses, answerBodyParsers) {
    return await saveResponsesToDatabase(models, userId, surveyResponses, answerBodyParsers);
  }

  /**
   * @param {ModelRegistry} models
   * @param {Answer[]} answers
   * @param {SurveyResponse["id"]} surveyResponseId
   * @param {Record<QuestionType, AnswerBodyParser> | undefined} answerBodyParsers
   * @returns {Promise<Answer[]>}
   * @privateRemarks Does not support offline photo and file uploads. Use
   * `@tupaia/central-server/dataAccessors/upsertAnswers` instead.
   */
  static async upsertAnswers(models, answers, surveyResponseId, answerBodyParsers) {
    return await upsertAnswers(models, answers, surveyResponseId, answerBodyParsers);
  }

  /**
   * @param {ModelRegistry} models
   */
  static async upsertEntitiesAndOptions(models, surveyResponses) {
    return await upsertEntitiesAndOptions(models, surveyResponses);
  }

  /**
   * @param {ModelRegistry} models
   */
  static async validateSurveyResponse(models, surveyResponseData) {
    return await validateSurveyResponse(models, surveyResponseData);
  }

  /**
   * @param {ModelRegistry} models
   */
  static async validateSurveyResponses(models, surveyResponseData) {
    return await validateSurveyResponses(models, surveyResponseData);
  }

  get DatabaseRecordClass() {
    return SurveyResponseRecord;
  }

  /**
   * @param {ModelRegistry} models
   * @param {AccessPolicy} accessPolicy
   * @param {Record<SurveyCode, Entity["code"][]>} entitiesBySurveyCode
   * @returns {true} If and only if the assertion passes, otherwise throws.
   * @throws {PermissionsError}
   */
  async assertCanImport(models, accessPolicy, entitiesBySurveyCode) {
    const allEntityCodes = flattenDeep(Object.values(entitiesBySurveyCode));
    const surveyCodes = Object.keys(entitiesBySurveyCode);

    await models.wrapInReadOnlyTransaction(async transactingModels => {
      /** @type {[EntityRecord[], SurveyRecord[]]} */
      const [allEntities, surveys] = await Promise.all([
        transactingModels.entity.findManyByColumn('code', allEntityCodes),
        transactingModels.survey.findManyByColumn('code', surveyCodes),
      ]);

      if (allEntities.some(isNullish)) {
        log.error('Unexpected nullish element in `allEntities`', { allEntities });
      }

      const codeToSurvey = keyBy(surveys, 'code');
      /** @type {PermissionGroup["id"][]} */
      const surveyPermissionGroupIds = surveys.map(s => s.permission_group_id);
      /** @type {PermissionGroupRecord[]} */
      const surveyPermissionGroups =
        await transactingModels.permissionGroup.findManyById(surveyPermissionGroupIds);
      const idToPermissionGroupName = reduceToDictionary(surveyPermissionGroups, 'id', 'name');

      for (const [surveyCode, entityCodes] of Object.entries(entitiesBySurveyCode)) {
        const survey = codeToSurvey[surveyCode];
        if (isNullish(survey)) {
          log.error(`Unexpected nullish survey (code '${surveyCode}')`, { codeToSurvey });
        }

        const responseEntities = allEntities.filter(e => entityCodes.includes(e.code));
        /** @type {Country["code"][]} */
        const surveyResponseCountryCodes = uniq(responseEntities.map(e => e.country_code));
        /** @type {CountryRecord[]} */
        const surveyResponseCountries = await transactingModels.country.findManyByColumn(
          'code',
          surveyResponseCountryCodes,
        );

        if (surveyResponseCountries.some(isNullish)) {
          log.error(`Unexpected nullish element in countries for survey  ${surveyCode}`, {
            surveyResponseCountries,
          });
        }

        if (surveyResponseCountries.length !== surveyResponseCountryCodes.length) {
          const diff = difference(
            surveyResponseCountryCodes,
            surveyResponseCountries.map(c => c.code),
          );
          throw new DatabaseError(
            `Couldn’t find the following countries: ${diff.join(', ')}`,
            surveyResponseCountryCodes,
          );
        }
        const entitiesByCountryCode = groupBy(responseEntities, 'country_code');

        for (const surveyResponseCountry of surveyResponseCountries) {
          // Check if the country of the submitted survey response(s) matches with the survey countries.
          if (
            survey.country_ids?.length &&
            !survey.country_ids.includes(surveyResponseCountry.id)
          ) {
            const surveyCountries = await transactingModels.country.findManyById(
              survey.country_ids,
            );

            const entities = entitiesByCountryCode[surveyResponseCountry.code];
            if (entities.some(isNullish)) {
              log.error('Unexpected nullish element in `entities`', { entities });
            }

            const entityCodesString = entities.map(e => e.code).join(', ');
            const surveyCountryNamesString = surveyCountries.map(s => s.name).join(', ');
            throw new Error(
              `Some survey response(s) submitted against entity code(s) (${entityCodesString}) that don’t belong to countries (${surveyCountryNamesString}) of survey ${survey.code}`,
            );
          }

          // Now check if users have permission group access to the survey response’s country
          const permissionGroup = idToPermissionGroupName[survey.permission_group_id];
          if (!accessPolicy.allows(surveyResponseCountry.code, permissionGroup)) {
            throw new PermissionsError(
              `Need ${permissionGroup} access to ${surveyResponseCountry.name} to import the survey response(s)`,
            );
          }
        }
      }
    });

    return true;
  }

  /**
   * @param {ModelRegistry} models
   * @param {AccessPolicy} accessPolicy
   * @param {Array} surveyResponses Assumed to have already been validated.
   * @returns {true} If and only if the assertion passes, otherwise throws.
   * @throws {PermissionsError}
   */
  async assertCanSubmit(models, accessPolicy, surveyResponses) {
    const entitiesBySurveyCode = {};

    /** @type {Survey["id"][]} */
    const surveyIds = uniq(surveyResponses.map(sr => sr.survey_id));

    /** @type {{attributes: Record<string, unknown>, code: Entity["code"], country_code: Country["code"], id: Entity["id"], name: Entity["name"], parent_id: Entity["id"], type: Entity["type"]}} */
    const entitiesUpserted = surveyResponses.reduce((acc, { entities_upserted }) => {
      if (entities_upserted) acc.push(...entities_upserted);
      return acc;
    }, []);

    return await models.wrapInReadOnlyTransaction(async transactingModels => {
      /** @type {SurveyRecord[]} */
      const surveys = await transactingModels.survey.findManyById(surveyIds);
      const surveyCodesById = reduceToDictionary(surveys, 'id', 'code');

      for (const response of surveyResponses) {
        const entityCode = await this.#getEntityCodeFromSurveyResponseChange(
          response,
          entitiesUpserted,
        );
        const surveyCode = surveyCodesById[response.survey_id];
        (entitiesBySurveyCode[surveyCode] ??= []).push(entityCode);
      }

      return await this.assertCanImport(transactingModels, accessPolicy, entitiesBySurveyCode);
    });
  }

  async getLeaderboard(projectId = '', rowCount = 10) {
    const bindings = projectId ? [projectId, rowCount] : [rowCount];
    const query = getLeaderboardQuery(projectId);
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

  async #getEntityCodeFromSurveyResponseChange(surveyResponse, entitiesUpserted) {
    // There are three valid ways to refer to the entity in a batch change:
    // entity_code, entity_id, clinic_id
    if (surveyResponse.entity_code) {
      return surveyResponse.entity_code;
    }

    if (surveyResponse.entity_id) {
      // If we're submitting a response against a new entity, it won't yet have a valid entity_code in
      // the server db. Instead, check our permissions against the new entity's parent
      const newEntity = entitiesUpserted.find(e => e.id === surveyResponse.entity_id);
      if (newEntity) {
        const parentEntity = await this.otherModels.entity.findById(newEntity.parent_id);
        return parentEntity?.code;
      }

      /** @type {EntityRecord} */
      const entity = ensure(
        await this.otherModels.entity.findById(surveyResponse.entity_id),
        `No entity exists with ID ${surveyResponse.entity_id}`,
      );
      return entity.code;
    }

    if (surveyResponse.clinic_id) {
      /** @type {FacilityRecord} */
      const facility = ensure(
        await this.otherModels.facility.findById(surveyResponse.clinic_id),
        `No facility exists with ID ${surveyResponse.clinic_id}`,
      );
      return facility.code;
    }

    throw new Error('Survey response change does not contain valid entity reference');
  }
}
