import { SyncDirections } from '@tupaia/constants';
import { hasBESAdminAccess } from '@tupaia/access-policy';

import { DatabaseRecord } from '../DatabaseRecord';
import { MaterializedViewLogDatabaseModel } from '../analytics';
import { RECORDS } from '../records';
import { buildSyncLookupSelect } from '../sync';
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

  async getLeaderboard(projectId = '', rowCount = 10) {
    const bindings = projectId ? [projectId, rowCount] : [rowCount];
    const query = getLeaderboard(projectId);
    return this.database.executeSql(query, bindings);
  }

  async createRecordsPermissionFilter(accessPolicy, criteria = {}, options = {}) {
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
}
