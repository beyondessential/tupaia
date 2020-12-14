/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import { QUERY_CONJUNCTIONS } from '@tupaia/database';
import { hasBESAdminAccess, TUPAIA_ADMIN_PANEL_PERMISSION_GROUP } from '../../permissions';
import { fetchCountryIdsByPermissionGroupId } from '../utilities';

const { RAW } = QUERY_CONJUNCTIONS;

const getPermissionInfoFromSurvey = async (models, surveyId) => {
  const survey = await models.survey.findById(surveyId);
  if (!survey) {
    throw new Error(`No survey exists with id ${surveyId}`);
  }

  const permissionGroup = await models.permissionGroup.findById(survey.permission_group_id);
  const countries = await models.country.findManyById(survey.country_ids);
  const countryCodes = countries.map(c => c.code);

  return { permissionGroup, countryCodes };
};

export const assertSurveyGetPermissions = async (accessPolicy, models, surveyId) => {
  const { permissionGroup, countryCodes } = getPermissionInfoFromSurvey(models, surveyId);
  if (accessPolicy.allowsSome(countryCodes, permissionGroup.name)) {
    return true;
  }

  throw new Error('Requires access to one of the countries the survey is in');
};

// Used for edit and delete actions
export const assertSurveyEditPermissions = async (accessPolicy, models, surveyId) => {
  const { permissionGroup, countryCodes } = getPermissionInfoFromSurvey(models, surveyId);
  if (
    accessPolicy.allowsAll(countryCodes, permissionGroup.name) &&
    accessPolicy.allowsAll(countryCodes, TUPAIA_ADMIN_PANEL_PERMISSION_GROUP)
  ) {
    return true;
  }

  throw new Error('Requires access to all of the countries the survey is in');
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
