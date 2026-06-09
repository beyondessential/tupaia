import { QUERY_CONJUNCTIONS, RECORDS } from '@tupaia/database';
import { ensure } from '@tupaia/tsutils';
import { hasBESAdminAccess } from '../../permissions';
import { assertSurveyEditPermissions } from '../surveys/assertSurveyPermissions';
import { mergeMultiJoin } from '../utilities';

const { RAW } = QUERY_CONJUNCTIONS;

export const assertSyncGroupEditPermissions = async (accessPolicy, models, syncGroupId) => {
  const syncGroup = ensure(
    await models.dataServiceSyncGroup.findById(syncGroupId),
    `No sync group exists with ID ${syncGroupId}`,
  );
  const dataGroup = await syncGroup.getDataGroup();
  const survey = await dataGroup.getSurvey();

  return assertSurveyEditPermissions(accessPolicy, models, survey.id);
};

export const createSyncGroupDBFilter = async (accessPolicy, models, criteria, options) => {
  const dbConditions = { ...criteria };
  const dbOptions = { ...options };

  if (hasBESAdminAccess(accessPolicy)) {
    return { dbConditions, dbOptions };
  }

  const countryIdsByPermissionGroupId =
    await models.permissionGroup.fetchCountryIdsByPermissionGroupId(accessPolicy);

  dbOptions.multiJoin = mergeMultiJoin(
    [
      {
        joinWith: RECORDS.DATA_GROUP,
        joinCondition: [
          `${RECORDS.DATA_GROUP}.code`,
          `${RECORDS.DATA_SERVICE_SYNC_GROUP}.data_group_code`,
        ],
      },
      {
        joinWith: RECORDS.SURVEY,
        joinCondition: [`${RECORDS.SURVEY}.data_group_id`, `${RECORDS.DATA_GROUP}.id`],
      },
    ],
    dbOptions.multiJoin,
  );

  dbConditions[RAW] = {
    sql: `
    (
      survey.country_ids
      &&
      ARRAY(
        SELECT TRIM('"' FROM JSON_ARRAY_ELEMENTS(?::JSON->survey.permission_group_id)::TEXT)
      )
    )`,
    parameters: JSON.stringify(countryIdsByPermissionGroupId),
  };

  return { dbConditions, dbOptions };
};
