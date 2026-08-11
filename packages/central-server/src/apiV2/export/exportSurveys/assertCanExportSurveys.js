import { flattenDeep } from 'es-toolkit/compat';

import { TUPAIA_ADMIN_PANEL_PERMISSION_GROUP } from '../../../permissions';

const getCountryNames = async (models, surveyCountryCodes) => {
  if (surveyCountryCodes) {
    const surveyCountries = await models.country.find({ code: surveyCountryCodes });
    return surveyCountries.map(c => c.name).join(',');
  }

  return 'any countries';
};

export const assertCanExportSurveys = async (accessPolicy, models, surveys) => {
  const surveyCountryIds = flattenDeep(surveys.map(s => s.country_ids));
  const surveyPermissionGroupIds = flattenDeep(surveys.map(s => s.permission_group_id));
  const countryCodeById = await models.country.getCountryCodeById(surveyCountryIds);
  const permissionGroupNameById =
    await models.permissionGroup.getPermissionGroupNameById(surveyPermissionGroupIds);

  for (const survey of surveys) {
    const surveyPermissionGroupName = permissionGroupNameById[survey.permission_group_id];
    const surveyCountryCodes =
      survey.country_ids && survey.country_ids.length
        ? survey.country_ids.map(id => countryCodeById[id])
        : null;

    if (!accessPolicy.allowsSome(surveyCountryCodes, surveyPermissionGroupName)) {
      const surveyCountryNamesString = await getCountryNames(models, surveyCountryCodes);

      throw new Error(
        `Need ${surveyPermissionGroupName} access to ${surveyCountryNamesString} to export the survey ${survey.name}`,
      );
    }

    if (!accessPolicy.allowsSome(surveyCountryCodes, TUPAIA_ADMIN_PANEL_PERMISSION_GROUP)) {
      const surveyCountryNamesString = await getCountryNames(models, surveyCountryCodes);

      throw new Error(
        `Need ${TUPAIA_ADMIN_PANEL_PERMISSION_GROUP} access to ${surveyCountryNamesString} to export the survey ${survey.name}`,
      );
    }
  }

  return true;
};
