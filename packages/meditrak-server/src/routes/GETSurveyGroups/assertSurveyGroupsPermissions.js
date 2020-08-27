/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import groupBy from 'lodash.groupby';
import keyBy from 'lodash.keyby';
import flattenDeep from 'lodash.flattendeep';
import { hasBESAdminAccess } from '../../permissions';

export const filterSurveyGroupsByPermissions = async (accessPolicy, models, surveyGroups) => {
  if (hasBESAdminAccess(accessPolicy)) {
    return surveyGroups;
  }

  const surveyGroupIds = surveyGroups.map(sg => sg.id);
  const surveys = await models.survey.findManyByColumn('survey_group_id', surveyGroupIds);
  const allSurveyCountryIds = flattenDeep(surveys.map(s => s.country_ids));
  const allCountries = await models.country.findManyById(allSurveyCountryIds);
  const countryById = keyBy(allCountries, 'id');
  const allPermissionGroupIds = surveys.map(s => s.permission_group_id);
  const allPermissionGroups = await models.permissionGroup.findManyById(allPermissionGroupIds);
  const permissionGroupById = keyBy(allPermissionGroups, 'id');
  const surveysGroupedBySurveyGroup = groupBy(surveys, 'survey_group_id');
  const filteredSurveyGroups = [];

  surveyGroups.forEach(surveyGroup => {
    let hasAccess = true;
    const groupedSurveys = surveysGroupedBySurveyGroup[surveyGroup.id];
    if (groupedSurveys) {
      hasAccess = groupedSurveys.some(survey => {
        const surveyCountries = survey.country_ids.map(countryId => countryById[countryId]);
        const surveyCountryCodes = surveyCountries.map(surveyCountry => surveyCountry.code);
        const surveyPermissionGroup = permissionGroupById[survey.permission_group_id];

        return accessPolicy.allowsSome(surveyCountryCodes, surveyPermissionGroup.name);
      });
    }

    if (hasAccess) {
      filteredSurveyGroups.push(surveyGroup);
    }
  });

  return filteredSurveyGroups;
};

export const assertSurveyGroupsPermissions = async (accessPolicy, models, surveyGroup) => {
  const filteredSurveyGroups = await filterSurveyGroupsByPermissions(accessPolicy, models, [
    surveyGroup,
  ]);

  if (!filteredSurveyGroups.length) {
    throw new Error('You do not have permissions for this survey group');
  }

  return true;
};
