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
  const permissionGroupNameById =
    await models.permissionGroup.getPermissionGroupNameById(allPermissionGroupIds);
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
  const dbConditions = { ...criteria };

  const countryIdsByPermissionGroupId =
    await models.permissionGroup.fetchCountryIdsByPermissionGroupId(accessPolicy);

  dbConditions[RAW] = {
    sql: `
    (
      -- Count the number of surveys in this survey group that we have permissions for
      -- and check that number is at least one
      (
        SELECT COUNT(*)
          FROM survey
          WHERE
            survey.survey_group_id = survey_group.id
          AND
            survey.country_ids
            &&
            ARRAY(
              SELECT TRIM('"' FROM JSON_ARRAY_ELEMENTS(?::JSON->survey.permission_group_id)::TEXT)
            )
      ) > 0
    )`,
    parameters: JSON.stringify(countryIdsByPermissionGroupId),
  };
  return dbConditions;
};
