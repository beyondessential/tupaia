import flattenDeep from 'lodash.flattendeep';
import keyBy from 'lodash.keyby';

import { TUPAIA_ADMIN_PANEL_PERMISSION_GROUP } from '../../permissions';

export const assertCanExportSurveys = async (accessPolicy, models, surveys) => {
  const surveyCountryIds = flattenDeep(surveys.map(s => s.country_ids));
  const surveyPermissionGroupIds = flattenDeep(surveys.map(s => s.permission_group_id));
  const allSurveyCountries = await models.country.find({
    id: surveyCountryIds,
  });
  const surveyPermissionGroups = await models.permissionGroup.find({
    id: surveyPermissionGroupIds,
  });
  const surveyCountryById = keyBy(allSurveyCountries, 'id');
  const surveyPermissionGroupById = keyBy(surveyPermissionGroups, 'id');

  for (const survey of surveys) {
    const surveyPermissionGroup = surveyPermissionGroupById[survey.permission_group_id];
    const surveyCountries =
      survey.country_ids && survey.country_ids.length
        ? survey.country_ids.map(id => surveyCountryById[id])
        : null;

    let surveyCountryNamesString = 'any countries';
    let surveyCountryCodes = null;

    if (surveyCountries) {
      surveyCountryCodes = surveyCountries.map(c => c.code);
      const surveyCountryNames = surveyCountries.map(c => c.name);
      surveyCountryNamesString = surveyCountryNames.join(',');
    }

    if (!accessPolicy.allowsSome(surveyCountryCodes, surveyPermissionGroup.name)) {
      throw new Error(
        `Need ${surveyPermissionGroup.name} access to ${surveyCountryNamesString} to export the survey ${survey.name}`,
      );
    }

    if (!accessPolicy.allowsSome(surveyCountryCodes, TUPAIA_ADMIN_PANEL_PERMISSION_GROUP)) {
      throw new Error(
        `Need ${TUPAIA_ADMIN_PANEL_PERMISSION_GROUP} access to ${surveyCountryNamesString} to export the survey ${survey.name}`,
      );
    }
  }
};
