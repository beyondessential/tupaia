/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { QUERY_CONJUNCTIONS, TYPES } from '@tupaia/database';
import { assertSurveyEditPermissions } from '../surveys/assertSurveyPermissions';
import { hasBESAdminAccess } from '../../permissions';
import { fetchCountryIdsByPermissionGroupId, mergeMultiJoin } from '../utilities';

const { RAW } = QUERY_CONJUNCTIONS;

export const assertSyncGroupEditPermissions = async (accessPolicy, models, syncGroupId) => {
  const syncGroup = await models.dataServiceSyncGroup.findById(syncGroupId);
  if (!syncGroup) {
    throw new Error(`No Sync Group exists with id ${syncGroupId}`);
  }

  const dataGroup = await models.dataGroup.findOne({ code: syncGroup.data_group_code });
  if (!dataGroup) {
    throw new Error(`Sync Group is not linked to an existing Data Group`);
  }

  const survey = await models.survey.findOne({ data_group_id: dataGroup.id });
  if (!survey) {
    throw new Error(`No Survey found for Data Group used by Sync Group`);
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
        joinWith: TYPES.DATA_GROUP,
        joinCondition: [
          `${TYPES.DATA_GROUP}.code`,
          `${TYPES.DATA_SERVICE_SYNC_GROUP}.data_group_code`,
        ],
      },
      {
        joinWith: TYPES.SURVEY,
        joinCondition: [`${TYPES.SURVEY}.data_group_id`, `${TYPES.DATA_GROUP}.id`],
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
