/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { QUERY_CONJUNCTIONS } from '@tupaia/database';
import { groupBy, flattenDeep } from 'lodash';
import { hasBESAdminAccess } from '../../permissions';

const { RAW } = QUERY_CONJUNCTIONS;

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

export const assertSurveyGroupsPermissions = async (accessPolicy, models, surveyGroupId) => {
  const surveyGroup = await models.surveyGroup.findById(surveyGroupId);
  const filteredSurveyGroups = await filterSurveyGroupsByPermissions(accessPolicy, models, [
    surveyGroup,
  ]);

  if (filteredSurveyGroups.length === 0) {
    throw new Error('You do not have permissions to access the requested survey group(s)');
  }

  return true;
};

export const createSurveyGroupDBFilter = async (accessPolicy, models, criteria) => {
  if (hasBESAdminAccess(accessPolicy)) {
    return criteria;
  }
  const dbConditions = criteria;
  const allPermissionGroupsNames = accessPolicy.getPermissionGroups();
  const countryIdsByPermissionGroupId = {};

  // Generate lists of country ids we have access to per permission group id
  for (const pg of allPermissionGroupsNames) {
    const permissionGroup = await models.permissionGroup.findOne({ name: pg });
    if (permissionGroup) {
      const countryNames = accessPolicy.getEntitiesAllowed(pg);
      const countryList = await models.country.find({ code: countryNames });
      countryIdsByPermissionGroupId[permissionGroup.id] = countryList.map(e => e.id);
    }
  }

  // Check we have permissions to at least one of the surveys in this group
  dbConditions[RAW] = {
    sql: `(select count(*) from survey where survey.survey_group_id = survey_group.id and country_ids && array(select trim('"' from json_array_elements(?::json->permission_group_id)::text))) > 0`,
    parameters: JSON.stringify(countryIdsByPermissionGroupId),
  };
  return dbConditions;
};
