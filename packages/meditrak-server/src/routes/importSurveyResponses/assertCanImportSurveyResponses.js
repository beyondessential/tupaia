/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { flattenDeep, groupBy, keyBy } from 'lodash';
import { reduceToDictionary } from '@tupaia/utils';

export const assertCanImportSurveyResponses = async (
  accessPolicy,
  models,
  entitiesBySurveyName,
) => {
  const allEntityCodes = flattenDeep(Object.values(entitiesBySurveyName));
  const surveyNames = Object.keys(entitiesBySurveyName);
  const allEntities = await models.entity.findManyByColumn('code', allEntityCodes);
  const surveys = await models.survey.findManyByColumn('name', surveyNames);
  const nameToSurvey = keyBy(surveys, 'name');
  const surveyPermissionGroupIds = surveys.map(s => s.permission_group_id);
  const surveyPermissionGroups = await models.permissionGroup.findManyById(
    surveyPermissionGroupIds,
  );
  const idToPermissionGroupName = reduceToDictionary(surveyPermissionGroups, 'id', 'name');

  for (const entry of Object.entries(entitiesBySurveyName)) {
    const [surveyName, entityCodes] = entry;
    const survey = nameToSurvey[surveyName];
    const responseEntities = allEntities.filter(e => entityCodes.includes(e.code));
    const surveyResponseCountryCodes = [...new Set(responseEntities.map(e => e.country_code))];
    const surveyResponseCountries = await models.country.findManyByColumn(
      'code',
      surveyResponseCountryCodes,
    );
    const entitiesByCountryCode = groupBy(responseEntities, 'country_code');

    for (const surveyResponseCountry of surveyResponseCountries) {
      // Check if the country of the submitted survey response(s) matches with the survey countries.
      if (survey.country_ids?.length && !survey.country_ids.includes(surveyResponseCountry.id)) {
        const surveyCountries = await models.country.findManyById(survey.country_ids);
        const entities = entitiesByCountryCode[surveyResponseCountry.code];
        const entityCodesString = entities.map(e => e.code).join(', ');
        const surveyCountryNamesString = surveyCountries.map(s => s.name).join(', ');
        throw new Error(
          `Some survey response(s) are submitted against entity code(s) (${entityCodesString}) that do not belong to the countries (${surveyCountryNamesString}) of the survey '${survey.name}'`,
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

export const assertSurveyResponseBatchPermissions = async (
  accessPolicy,
  models,
  surveyResponses,
) => {
  // Assumes the data has already been validated
  const entitiesGroupedBySurveyName = {};

  for (const response of surveyResponses) {
    // There are three valid ways to refer to the entity in a batch change
    const entityCode =
      response.entity_code ||
      (response.entity_id
        ? (await models.entity.findById(response.entity_id)).code
        : (await models.facility.findById(response.clinic_id)).code);
    const surveyName = (await models.survey.findById(response.survey_id)).name;

    if (!entitiesGroupedBySurveyName[surveyName]) {
      entitiesGroupedBySurveyName[surveyName] = [];
    }
    entitiesGroupedBySurveyName[surveyName].push(entityCode);
  }

  return assertCanImportSurveyResponses(accessPolicy, models, entitiesGroupedBySurveyName);
};
