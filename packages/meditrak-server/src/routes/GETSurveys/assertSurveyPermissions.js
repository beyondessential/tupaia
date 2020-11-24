/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import { QUERY_CONJUNCTIONS } from '@tupaia/database';
import { hasBESAdminAccess } from '../../permissions';
import { fetchCountryIdsByPermissionGroupId } from '../utilities';

const { RAW } = QUERY_CONJUNCTIONS;

export const assertSurveyPermissions = async (accessPolicy, models, surveyId) => {
  const survey = await models.survey.findById(surveyId);
  if (!survey) {
    throw new Error(`No survey exists with id ${surveyId}`);
  }

  const permissionGroup = await models.permissionGroup.findById(survey.permission_group_id);
  const countries = await models.country.findManyById(survey.country_ids);
  const countryCodes = countries.map(c => c.code);

  if (accessPolicy.allowsSome(countryCodes, permissionGroup.name)) {
    return true;
  }

  throw new Error('Requires access to one of the countries the survey is in');
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
