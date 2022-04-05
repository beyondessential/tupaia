/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { flattenDeep, groupBy, keyBy } from 'lodash';
import { getUniqueEntries, reduceToDictionary } from '@tupaia/utils';

export const assertCanImportSurveyResponses = async (
  accessPolicy,
  models,
  entitiesBySurveyCode,
) => {
  const allEntityCodes = flattenDeep(Object.values(entitiesBySurveyCode));
  const surveyCodes = Object.keys(entitiesBySurveyCode);
  const allEntities = await models.entity.findManyByColumn('code', allEntityCodes);
  const surveys = await models.survey.findManyByColumn('code', surveyCodes);
  const codeToSurvey = keyBy(surveys, 'code');
  const surveyPermissionGroupIds = surveys.map(s => s.permission_group_id);
  const surveyPermissionGroups = await models.permissionGroup.findManyById(
    surveyPermissionGroupIds,
  );
  const idToPermissionGroupName = reduceToDictionary(surveyPermissionGroups, 'id', 'name');

  for (const entry of Object.entries(entitiesBySurveyCode)) {
    const [surveyCode, entityCodes] = entry;
    const survey = codeToSurvey[surveyCode];
    const responseEntities = allEntities.filter(e => entityCodes.includes(e.code));
    const surveyResponseCountryCodes = [...new Set(responseEntities.map(e => e.country_code))];
    const surveyResponseCountries = await models.country.findManyByColumn(
      'code',
      surveyResponseCountryCodes,
    );
    if (surveyResponseCountries.length !== surveyResponseCountryCodes.length) {
      throw new Error(`Could not find all countries`, surveyResponseCountryCodes);
    }
    const entitiesByCountryCode = groupBy(responseEntities, 'country_code');

    for (const surveyResponseCountry of surveyResponseCountries) {
      // Check if the country of the submitted survey response(s) matches with the survey countries.
      if (survey.country_ids?.length && !survey.country_ids.includes(surveyResponseCountry.id)) {
        const surveyCountries = await models.country.findManyById(survey.country_ids);
        const entities = entitiesByCountryCode[surveyResponseCountry.code];
        const entityCodesString = entities.map(e => e.code).join(', ');
        const surveyCountryNamesString = surveyCountries.map(s => s.name).join(', ');
        throw new Error(
          `Some survey response(s) are submitted against entity code(s) (${entityCodesString}) that do not belong to the countries (${surveyCountryNamesString}) of the survey '${survey.name}' (${survey.code})`,
        );
      }

      // Now check if users have permission group access to the survey response's country
      const permissionGroup = idToPermissionGroupName[survey.permission_group_id];
      if (!accessPolicy.allows(surveyResponseCountry.code, permissionGroup)) {
        throw new Error(
          `Need ${permissionGroup} access to ${surveyResponseCountry.name} to import the survey response(s)`,
        );
      }
    }
  }

  return true;
};

const getEntityCodeFromSurveyResponseChange = async (models, surveyResponse, entitiesCreated) => {
  // There are three valid ways to refer to the entity in a batch change:
  // entity_code, entity_id, clinic_id
  if (surveyResponse.entity_code) {
    return surveyResponse.entity_code;
  }
  if (surveyResponse.entity_id) {
    // If we're submitting a response against a new entity, it won't yet have a valid entity_code in
    // the server db. Instead, check our permissions against the new entity's parent
    const newEntity = entitiesCreated.find(e => e.id === surveyResponse.entity_id);
    if (newEntity) {
      const parentEntity = await models.entity.findById(newEntity.parent_id);
      return parentEntity.code;
    }
    const entity = await models.entity.findById(surveyResponse.entity_id);
    return entity.code;
  }
  if (surveyResponse.clinic_id) {
    const clinic = await models.facility.findById(surveyResponse.clinic_id);
    return clinic.code;
  }

  throw new Error('Survey response change does not contain valid entity reference');
};

export const assertCanSubmitSurveyResponses = async (accessPolicy, models, surveyResponses) => {
  // Assumes the data has already been validated
  const entitiesBySurveyCode = {};

  // Pre-fetch unique surveys
  const surveyIds = getUniqueEntries(surveyResponses.map(sr => sr.survey_id));
  const surveys = await models.survey.findManyById(surveyIds);
  const surveyCodesById = reduceToDictionary(surveys, 'id', 'code');

  const entitiesCreated = surveyResponses
    .filter(sr => !!sr.entities_created)
    .map(sr => sr.entities_created)
    .flat();

  for (const response of surveyResponses) {
    const entityCode = await getEntityCodeFromSurveyResponseChange(
      models,
      response,
      entitiesCreated,
    );
    const surveyCode = surveyCodesById[response.survey_id];

    if (!entitiesBySurveyCode[surveyCode]) {
      entitiesBySurveyCode[surveyCode] = [];
    }
    entitiesBySurveyCode[surveyCode].push(entityCode);
  }

  return assertCanImportSurveyResponses(accessPolicy, models, entitiesBySurveyCode);
};
