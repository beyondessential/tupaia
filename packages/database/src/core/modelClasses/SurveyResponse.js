import { flattenDeep, groupBy, keyBy } from 'lodash';

import { SyncDirections } from '@tupaia/constants';
import { isNullish } from '@tupaia/tsutils';
import { getUniqueEntries, reduceToDictionary } from '@tupaia/utils';

import { DatabaseRecord } from '../DatabaseRecord';
import { MaterializedViewLogDatabaseModel } from '../analytics';
import { RECORDS } from '../records';
import { buildSyncLookupSelect } from '../sync';
import { hasBESAdminAccess } from '@tupaia/access-policy';
import { mergeMultiJoin } from '../utilities/mergeMultiJoin';
import { QUERY_CONJUNCTIONS } from '../BaseDatabase';

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
    return this.otherModels.answer.find({ survey_response_id: this.id, ...conditions });
  }
}

export class SurveyResponseModel extends MaterializedViewLogDatabaseModel {
  static syncDirection = SyncDirections.BIDIRECTIONAL;

  get DatabaseRecordClass() {
    return SurveyResponseRecord;
  }

  async buildSyncLookupQueryDetails() {
    return {
      select: await buildSyncLookupSelect(this, {
        projectIds: `ARRAY[survey.project_id]`,
      }),
      joins: `
        LEFT JOIN survey 
          ON survey.id = survey_response.survey_id 
          AND survey_response.outdated IS FALSE -- no outdated survey response
      `,
    };
  }

  async getLeaderboard(projectId = '', rowCount = 10) {
    const bindings = projectId ? [projectId, rowCount] : [rowCount];
    const query = getLeaderboard(projectId);
    return this.database.executeSql(query, bindings);
  }

  async createPermissionsFilter(accessPolicy, criteria, options) {
    const dbConditions = { ...criteria };
    const dbOptions = { ...options };

    if (hasBESAdminAccess(accessPolicy)) {
      return { dbConditions, dbOptions };
    }

    const countryCodesByPermissionGroupId =
      await this.otherModels.permissionGroup.fetchCountryCodesByPermissionGroupId(accessPolicy);

    // Join SQL table with entity and survey tables
    // Running the permissions filtering is much faster with joins than records individually
    dbOptions.multiJoin = mergeMultiJoin(
      [
        {
          joinWith: RECORDS.SURVEY,
          joinCondition: [`${RECORDS.SURVEY}.id`, `${RECORDS.SURVEY_RESPONSE}.survey_id`],
        },
        {
          joinWith: RECORDS.ENTITY,
          joinCondition: [`${RECORDS.ENTITY}.id`, `${RECORDS.SURVEY_RESPONSE}.entity_id`],
        },
      ],
      dbOptions.multiJoin,
    );

    // Check the country code of the entity exists in our list for the permission group
    // of the survey
    dbConditions[QUERY_CONJUNCTIONS.RAW] = {
      sql: `
        entity.country_code IN (
          SELECT TRIM('"' FROM JSON_ARRAY_ELEMENTS(?::JSON->survey.permission_group_id)::TEXT)
        )
      `,
      parameters: JSON.stringify(countryCodesByPermissionGroupId),
    };

    return { dbConditions, dbOptions };
  }

  async assertCanImportSurveyResponses(accessPolicy, entitiesBySurveyCode) {
    const allEntityCodes = flattenDeep(Object.values(entitiesBySurveyCode));
    const surveyCodes = Object.keys(entitiesBySurveyCode);

    await this.wrapInReadOnlyTransaction(async transactingModels => {
      const [allEntities, surveys] = await Promise.all([
        transactingModels.entity.findManyByColumn('code', allEntityCodes),
        transactingModels.survey.findManyByColumn('code', surveyCodes),
      ]);

      if (allEntities.some(isNullish)) {
        winston.error('Unexpected nullish element in `allEntities`', { allEntities });
      }

      const codeToSurvey = keyBy(surveys, 'code');
      const surveyPermissionGroupIds = surveys.map(s => s.permission_group_id);
      const surveyPermissionGroups =
        await transactingModels.permissionGroup.findManyById(surveyPermissionGroupIds);
      const idToPermissionGroupName = reduceToDictionary(surveyPermissionGroups, 'id', 'name');

      for (const [surveyCode, entityCodes] of Object.entries(entitiesBySurveyCode)) {
        const survey = codeToSurvey[surveyCode];

        if (isNullish(survey)) {
          winston.error(`Unexpected nullish survey (code '${surveyCode}')`, { codeToSurvey });
        }

        const responseEntities = allEntities.filter(e => entityCodes.includes(e.code));
        const surveyResponseCountryCodes = [...new Set(responseEntities.map(e => e.country_code))];
        const surveyResponseCountries = await transactingModels.country.findManyByColumn(
          'code',
          surveyResponseCountryCodes,
        );

        if (surveyResponseCountries.some(isNullish)) {
          winston.error('Unexpected nullish element in `surveyResponseCountries`', {
            surveyResponseCountries,
          });
        }

        if (surveyResponseCountries.length !== surveyResponseCountryCodes.length) {
          const expected = surveyResponseCountryCodes;
          const actual = surveyResponseCountries.map(c => c.code);
          const difference = actual.filter(c => !expected.includes(c));
          throw new Error(
            `Couldn’t find the following countries: ${difference.join(', ')}`,
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
              winston.error('Unexpected nullish element in `entities`', { entities });
            }

            const entityCodesString = entities.map(e => e.code).join(', ');
            const surveyCountryNamesString = surveyCountries.map(s => s.name).join(', ');
            throw new Error(
              `Some survey response(s) are submitted against entity code(s) (${entityCodesString}) that do not belong to the countries (${surveyCountryNamesString}) of the survey '${survey.name}' (${survey.code})`,
            );
          }

          // Now check if users have permission group access to the survey response's country
          const permissionGroup = idToPermissionGroupName[survey.permission_group_id];
          if (!accessPolicy.allows(surveyResponseCountry.code, permissionGroup)) {
            throw new Error(
              `Need ${permissionGroup} access to ${surveyResponseCountry.name} to import the survey response(s)`,
            );
          }
        }
      }
    });

    return true;
  }

  async getEntityCodeFromSurveyResponseChange(surveyResponse, entitiesUpserted) {
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
      const entity = await this.otherModels.entity.findById(surveyResponse.entity_id);
      return entity.code;
    }
    if (surveyResponse.clinic_id) {
      const clinic = await this.otherModels.facility.findById(surveyResponse.clinic_id);
      return clinic.code;
    }

    throw new Error('Survey response change does not contain valid entity reference');
  }

  async assertCanSubmitSurveyResponses(accessPolicy, surveyResponses) {
    // Assumes the data has already been validated
    const entitiesBySurveyCode = {};

    // Pre-fetch unique surveys
    const surveyIds = getUniqueEntries(surveyResponses.map(sr => sr.survey_id));

    await this.wrapInReadOnlyTransaction(async transactingModels => {
      const surveys = await transactingModels.survey.findManyById(surveyIds);
      const surveyCodesById = reduceToDictionary(surveys, 'id', 'code');

      const entitiesUpserted = surveyResponses
        .filter(sr => !!sr.entities_upserted)
        .flatMap(sr => sr.entities_upserted);

      for (const response of surveyResponses) {
        const entityCode = await getEntityCodeFromSurveyResponseChange(
          transactingModels,
          response,
          entitiesUpserted,
        );
        const surveyCode = surveyCodesById[response.survey_id];
        (entitiesBySurveyCode[surveyCode] ??= []).push(entityCode);
      }
    });

    return this.assertCanImportSurveyResponses(accessPolicy, entitiesBySurveyCode);
  }
}
