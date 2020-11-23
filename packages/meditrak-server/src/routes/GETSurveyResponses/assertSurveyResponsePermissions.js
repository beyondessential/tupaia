/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { QUERY_CONJUNCTIONS, TYPES } from '@tupaia/database';
import { hasBESAdminAccess } from '../../permissions';
import { mergeMultiJoin } from '../utilities';

const { RAW } = QUERY_CONJUNCTIONS;

export const assertSurveyResponsePermissions = async (accessPolicy, models, surveyResponseId) => {
  const surveyResponse = await models.surveyResponse.findById(surveyResponseId);
  if (!surveyResponse) {
    throw new Error(`No survey response exists with id ${surveyResponseId}`);
  }

  const entity = await models.entity.findById(surveyResponse.entity_id);
  const survey = await models.survey.findById(surveyResponse.survey_id);
  const permissionGroup = await models.permissionGroup.findById(survey.permission_group_id);

  if (!accessPolicy.allows(entity.country_code, permissionGroup.name)) {
    throw new Error('You do not have permissions for this survey response');
  }
  return true;
};

export const createSurveyResponseDBFilter = async (accessPolicy, models, criteria, options) => {
  const dbConditions = { ...criteria };
  const dbOptions = { ...options };

  if (hasBESAdminAccess(accessPolicy)) {
    return { dbConditions, dbOptions };
  }

  const allPermissionGroupsNames = accessPolicy.getPermissionGroups();
  const countryCodesByPermissionGroupId = {};

  // Generate lists of country codes we have access to per permission group id
  for (const permissionGroupName of allPermissionGroupsNames) {
    const permissionGroup = await models.permissionGroup.findOne({ name: permissionGroupName });
    if (permissionGroup) {
      const countryNames = accessPolicy.getEntitiesAllowed(permissionGroupName);
      countryCodesByPermissionGroupId[permissionGroup.id] = countryNames;
    }
  }

  // Join SQL table with entity and survey tables
  // Running the permissions filtering is much faster with joins than records individually
  dbOptions.multiJoin = mergeMultiJoin(
    [
      {
        joinWith: TYPES.SURVEY,
        joinCondition: [`${TYPES.SURVEY}.id`, `${TYPES.SURVEY_RESPONSE}.survey_id`],
      },
      {
        joinWith: TYPES.ENTITY,
        joinCondition: [`${TYPES.ENTITY}.id`, `${TYPES.SURVEY_RESPONSE}.entity_id`],
      },
    ],
    dbOptions.multiJoin,
  );

  // Check the country code of the entity exists in our list for the permission group
  // of the survey
  dbConditions[RAW] = {
    sql: `
    (
      ARRAY[entity.country_code]::TEXT[]
      <@
      ARRAY(
        SELECT TRIM('"' FROM JSON_ARRAY_ELEMENTS(?::JSON->survey.permission_group_id)::TEXT)
      )
    )`,
    parameters: JSON.stringify(countryCodesByPermissionGroupId),
  };

  return { dbConditions, dbOptions };
};
