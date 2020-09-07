/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { groupBy, flattenDeep } from 'lodash';
import { hasBESAdminAccess } from '../../permissions';

export const filterSurveyGroupsByPermissions = async (accessPolicy, models, surveyGroups) => {
  if (hasBESAdminAccess(accessPolicy)) {
    return surveyGroups;
  }

  const surveyGroupIds = surveyGroups.map(sg => sg.id);
  const surveys = await models.survey.findManyByColumn('survey_group_id', surveyGroupIds);
  const allSurveyCountryIds = flattenDeep(surveys.map(s => s.country_ids));
  const countryCodeById = await models.country.getCountryCodeById(allSurveyCountryIds);
  const allPermissionGroupIds = surveys.map(s => s.permission_group_id);
  const permissionGroupNameById = await models.permissionGroup.getPermissionGroupNameById(
    allPermissionGroupIds,
  );
  const surveysGroupedBySurveyGroup = groupBy(surveys, 'survey_group_id');

  const filteredSurveyGroups = surveyGroups.filter(surveyGroup => {
    const groupedSurveys = surveysGroupedBySurveyGroup[surveyGroup.id];
    if (!groupedSurveys) {
      return true; // no surveys in this group, so no need to restrict access
    }

    // this survey group is accessible if the user has access to all of the surveys contained within
    return groupedSurveys.some(survey => {
      const surveyCountryCodes = survey.country_ids.map(countryId => countryCodeById[countryId]);
      const surveyPermissionGroupName = permissionGroupNameById[survey.permission_group_id];
      return accessPolicy.allowsSome(surveyCountryCodes, surveyPermissionGroupName);
    });
  });

  return filteredSurveyGroups;
};

export const assertSurveyGroupsPermissions = async (accessPolicy, models, surveyGroup) => {
  const filteredSurveyGroups = await filterSurveyGroupsByPermissions(accessPolicy, models, [
    surveyGroup,
  ]);

  if (!filteredSurveyGroups.length) {
    throw new Error('You do not have permissions to access this survey group');
  }

  return true;
};
