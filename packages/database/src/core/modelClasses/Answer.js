import { SyncDirections } from '@tupaia/constants';
import { hasBESAdminAccess } from '@tupaia/access-policy';

import { MaterializedViewLogDatabaseModel } from '../analytics';
import { DatabaseRecord } from '../DatabaseRecord';
import { RECORDS } from '../records';
import { buildSyncLookupSelect } from '../sync';
import { QUERY_CONJUNCTIONS } from '../BaseDatabase';
import { mergeMultiJoin } from '../utilities/mergeMultiJoin';

export class AnswerRecord extends DatabaseRecord {
  static databaseRecord = RECORDS.ANSWER;
}

export class AnswerModel extends MaterializedViewLogDatabaseModel {
  static syncDirection = SyncDirections.BIDIRECTIONAL;

  async createPermissionsFilter(accessPolicy, criteria, options) {
    const dbConditions = { ...criteria };
    const dbOptions = { ...options };
  
    if (hasBESAdminAccess(accessPolicy)) {
      return { dbConditions, dbOptions };
    }
  
    const countryCodesByPermissionGroupId =
      await this.otherModels.permissionGroup.fetchCountryCodesByPermissionGroupId(accessPolicy);
  
    // Join SQL table with survey_response, entity and survey tables
    // Running the permissions filtering is much faster with joins than records individually
    dbOptions.multiJoin = mergeMultiJoin(
      [
        {
          joinWith: RECORDS.SURVEY_RESPONSE,
          joinCondition: [`${RECORDS.SURVEY_RESPONSE}.id`, `${RECORDS.ANSWER}.survey_response_id`],
        },
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
  };

  async buildSyncLookupQueryDetails() {
    return {
      select: await buildSyncLookupSelect(this, {
        projectIds: `ARRAY[survey.project_id]`,
      }),
      joins: `
        LEFT JOIN survey_response ON survey_response.id = answer.survey_response_id
        LEFT JOIN survey ON survey.id = survey_response.survey_id
      `,
    };
  }

  get DatabaseRecordClass() {
    return AnswerRecord;
  }
}
