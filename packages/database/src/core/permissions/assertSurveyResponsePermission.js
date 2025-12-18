import { hasBESAdminAccess } from '@tupaia/access-policy';

import { mergeMultiJoin } from '../utilities/mergeMultiJoin';
import { RECORDS } from '../records';
import { QUERY_CONJUNCTIONS } from '../BaseDatabase';

export async function createSurveyResponsePermissionFilter(accessPolicy, models, criteria = {}, options = {}) {
  const dbConditions = { ...criteria };
  const dbOptions = { ...options };

  if (hasBESAdminAccess(accessPolicy)) {
    return { dbConditions, dbOptions };
  }

  const countryCodesByPermissionGroupId =
    await models.permissionGroup.fetchCountryCodesByPermissionGroupId(accessPolicy);

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
