/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { QUERY_CONJUNCTIONS, TYPES } from '@tupaia/database';
import { hasBESAdminAccess } from '../../permissions';
import { mergeMultiJoin } from '../utilities';
import { assertSurveyResponsePermissions } from '../GETSurveyResponses';

const { RAW } = QUERY_CONJUNCTIONS;

export const assertAnswerPermissions = async (accessPolicy, models, answerId) => {
  const answer = await models.answer.findById(answerId);
  if (!answer) {
    throw new Error(`No answer exists with id ${answerId}`);
  }

  return assertSurveyResponsePermissions(accessPolicy, models, answer.survey_response_id);
};

export const createAnswerDBFilter = async (accessPolicy, models, criteria, options) => {
  const dbConditions = { ...criteria };
  const dbOptions = { ...options };

  if (hasBESAdminAccess(accessPolicy)) {
    return { dbConditions, dbOptions };
  }

  // Generate lists of country codes we have access to per permission group id
  const allPermissionGroupsNames = accessPolicy.getPermissionGroups();
  const countryCodesByPermissionGroupId = {};
  const permissionGroupNameToId = await models.permissionGroup.findIdByField(
    'name',
    allPermissionGroupsNames,
  );
  for (const [permissionGroupName, permissionGroupId] of Object.entries(permissionGroupNameToId)) {
    const countryCodes = accessPolicy.getEntitiesAllowed(permissionGroupName);
    countryCodesByPermissionGroupId[permissionGroupId] = countryCodes;
  }

  // Join SQL table with survey_response, entity and survey tables
  // Running the permissions filtering is much faster with joins than records individually
  dbOptions.multiJoin = mergeMultiJoin(
    [
      {
        joinWith: TYPES.SURVEY_RESPONSE,
        joinCondition: [`${TYPES.SURVEY_RESPONSE}.id`, `${TYPES.ANSWER}.survey_response_id`],
      },
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
