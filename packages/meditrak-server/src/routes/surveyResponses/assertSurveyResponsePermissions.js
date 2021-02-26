/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { QUERY_CONJUNCTIONS, TYPES } from '@tupaia/database';
import { hasBESAdminAccess } from '../../permissions';
import { fetchCountryCodesByPermissionGroupId, mergeMultiJoin } from '../utilities';

const { RAW } = QUERY_CONJUNCTIONS;

const assertSurveyEntityPairPermission = async (accessPolicy, models, surveyId, entityId) => {
  const entity = await models.entity.findById(entityId);
  const survey = await models.survey.findById(surveyId);
  const permissionGroup = await models.permissionGroup.findById(survey.permission_group_id);

  if (!accessPolicy.allows(entity.country_code, permissionGroup.name)) {
    throw new Error('You do not have permissions for this survey in this country');
  }
  return true;
};

export const assertSurveyResponsePermissions = async (accessPolicy, models, surveyResponseId) => {
  const surveyResponse = await models.surveyResponse.findById(surveyResponseId);
  if (!surveyResponse) {
    throw new Error(`No survey response exists with id ${surveyResponseId}`);
  }

  return assertSurveyEntityPairPermission(
    accessPolicy,
    models,
    surveyResponse.survey_id,
    surveyResponse.entity_id,
  );
};

export const assertSurveyResponseEditPermissions = async (
  accessPolicy,
  models,
  surveyResponseId,
  updatedFields,
) => {
  // If we update survey_id or entity_id, check that we would still have permission for the result
  if (updatedFields.survey_id || updatedFields.entity_id) {
    const surveyResponse = await models.surveyResponse.findById(surveyResponseId);
    const surveyId = updatedFields.survey_id ? updatedFields.survey_id : surveyResponse.survey_id;
    const entityId = updatedFields.entity_id ? updatedFields.entity_id : surveyResponse.entity_id;

    await assertSurveyEntityPairPermission(accessPolicy, models, surveyId, entityId);
  }
  return true;
};

export const createSurveyResponseDBFilter = async (accessPolicy, models, criteria, options) => {
  const dbConditions = { ...criteria };
  const dbOptions = { ...options };

  if (hasBESAdminAccess(accessPolicy)) {
    return { dbConditions, dbOptions };
  }

  const countryCodesByPermissionGroupId = await fetchCountryCodesByPermissionGroupId(
    accessPolicy,
    models,
  );

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
      entity.country_code IN (
        SELECT TRIM('"' FROM JSON_ARRAY_ELEMENTS(?::JSON->survey.permission_group_id)::TEXT)
      )
    `,
    parameters: JSON.stringify(countryCodesByPermissionGroupId),
  };

  return { dbConditions, dbOptions };
};
