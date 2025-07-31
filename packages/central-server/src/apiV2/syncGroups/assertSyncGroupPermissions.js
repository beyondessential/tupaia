import { QUERY_CONJUNCTIONS, RECORDS } from '@tupaia/database';
import { assertSurveyEditPermissions } from '../surveys/assertSurveyPermissions';
import { hasBESAdminAccess } from '../../permissions';
import { fetchCountryIdsByPermissionGroupId, mergeMultiJoin } from '../utilities';
import { NotFoundError, PermissionsError } from '@tupaia/utils';

const { RAW } = QUERY_CONJUNCTIONS;

export const assertSyncGroupEditPermissions = async (accessPolicy, models, syncGroupId) => {
  const syncGroup = await models.dataServiceSyncGroup.findById(syncGroupId);
  if (!syncGroup) {
    throw new NotFoundError(`No sync group exists with ID ${syncGroupId}`);
  }

  const dataGroup = await models.dataGroup.findOne({ code: syncGroup.data_group_code });
  if (!dataGroup) {
    throw new PermissionsError('Sync group is not linked to an existing data group');
  }

  const survey = await models.survey.findOne({ data_group_id: dataGroup.id });
  if (!survey) {
    throw new Error(`No survey found for data group used by sync group`);
  }

  return assertSurveyEditPermissions(accessPolicy, models, survey.id);
};

export const createSyncGroupDBFilter = async (accessPolicy, models, criteria, options) => {
  const dbConditions = { ...criteria };
  const dbOptions = { ...options };

  if (hasBESAdminAccess(accessPolicy)) {
    return { dbConditions, dbOptions };
  }

  const countryIdsByPermissionGroupId = await fetchCountryIdsByPermissionGroupId(
    accessPolicy,
    models,
  );

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
