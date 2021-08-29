/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import { QUERY_CONJUNCTIONS } from '@tupaia/database';
import { hasBESAdminAccess, TUPAIA_ADMIN_PANEL_PERMISSION_GROUP } from '../../permissions';
import { fetchCountryIdsByPermissionGroupId } from '../utilities';

const { RAW } = QUERY_CONJUNCTIONS;

const DEFAULT_SURVEY_ERROR_MESSAGE = 'Requires access to one of the countries the survey is in';

export const assertSurveyGetPermissions = async (accessPolicy, models, surveyId) => {
  const survey = await models.survey.findById(surveyId);
  if (!survey) {
    throw new Error(`No survey exists with id ${surveyId}`);
  }
  const permissionGroup = await survey.getPermissionGroup();
  const countryCodes = await survey.getCountryCodes();

  if (accessPolicy.allowsSome(countryCodes, permissionGroup.name)) {
    return true;
  }

  throw new Error(DEFAULT_SURVEY_ERROR_MESSAGE);
};

// Used for edit and delete actions
export const assertSurveyEditPermissions = async (
  accessPolicy,
  models,
  surveyId,
  errorMessage = DEFAULT_SURVEY_ERROR_MESSAGE,
) => {
  const survey = await models.survey.findById(surveyId);
  if (!survey) {
    throw new Error(`No survey exists with id ${surveyId}`);
  }
  const permissionGroup = await survey.getPermissionGroup();
  const countryCodes = await survey.getCountryCodes();

  if (
    accessPolicy.allowsAll(countryCodes, permissionGroup.name) &&
    accessPolicy.allowsAll(countryCodes, TUPAIA_ADMIN_PANEL_PERMISSION_GROUP)
  ) {
    return true;
  }

  throw new Error(errorMessage);
};

export const createSurveyDBFilter = async (accessPolicy, models, criteria) => {
  if (hasBESAdminAccess(accessPolicy)) {
    return criteria;
  }
  const dbConditions = { ...criteria };

  const countryIdsByPermissionGroupId = await fetchCountryIdsByPermissionGroupId(
    accessPolicy,
    models,
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
  return dbConditions;
};

export const createSurveyViaCountryDBFilter = async (accessPolicy, models, criteria, countryId) => {
  const dbConditions = { ...criteria };

  const countryIdsByPermissionGroupId = await fetchCountryIdsByPermissionGroupId(
    accessPolicy,
    models,
  );

  // Even if we're BES admin, we need to filter by the country
  if (hasBESAdminAccess(accessPolicy)) {
    dbConditions[RAW] = {
      sql: `
      (
        ARRAY[?]
        <@
        survey.country_ids
      )`,
      parameters: countryId,
    };
  } else {
    dbConditions[RAW] = {
      sql: `
      (
        (
          ARRAY[?]
          <@
          survey.country_ids
        )
        AND
        (
          survey.country_ids
          &&
          ARRAY(
            SELECT TRIM('"' FROM JSON_ARRAY_ELEMENTS(?::JSON->survey.permission_group_id)::TEXT)
          )
        )
      )`,
      parameters: [countryId, JSON.stringify(countryIdsByPermissionGroupId)],
    };
  }
  return dbConditions;
};
