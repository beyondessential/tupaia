import { PermissionsError } from '@tupaia/utils';
import { TUPAIA_ADMIN_PANEL_PERMISSION_GROUP } from '../../permissions';

const assertCanImportExistingSurvey = async (accessPolicy, models, survey) => {
  const surveyCountries = await models.country.find({
    id: survey.country_ids,
  });
  const surveyPermissionGroup = await models.permissionGroup.findOne({
    id: survey.permission_group_id,
  });
  const surveyCountryCodes = surveyCountries.map(c => c.code);
  const surveyCountryNames = surveyCountries.map(c => c.name);
  const surveyCountryNamesString = surveyCountryNames.join(',');

  if (!accessPolicy.allowsAll(surveyCountryCodes, surveyPermissionGroup.name)) {
    throw new Error(
      `Need ${surveyPermissionGroup.name} access to ${surveyCountryNamesString} to import the survey ${survey.name}`,
    );
  }

  if (!accessPolicy.allowsAll(surveyCountryCodes, TUPAIA_ADMIN_PANEL_PERMISSION_GROUP)) {
    throw new Error(
      `Need ${TUPAIA_ADMIN_PANEL_PERMISSION_GROUP} access to ${surveyCountryNamesString} to import the survey ${survey.name}`,
    );
  }
};

export const assertCanImportSurvey = async (accessPolicy, models, surveyId, newCountryIds) => {
  const survey = surveyId ? await models.survey.findById(surveyId) : null;

  // If countries are selected when import surveys, it will update the country_ids of the survey
  // So we need to check if the user has TUPAIA_ADMIN_PANEL_PERMISSION_GROUP to the new specified countries for the surveys
  if (newCountryIds) {
    const newCountries = await models.country.find({
      id: newCountryIds,
    });
    const newCountryCodes = newCountries.map(c => c.code);

    if (!accessPolicy.allowsAll(newCountryCodes, TUPAIA_ADMIN_PANEL_PERMISSION_GROUP)) {
      const newCountryNames = newCountries.map(c => c.name);
      const newCountryNamesString = newCountryNames.join(',');

      throw new PermissionsError(
        `Need ${TUPAIA_ADMIN_PANEL_PERMISSION_GROUP} access to ${newCountryNamesString} to import the surveys`,
      );
    }
  } else if (!survey) {
    // If users are importing a new survey, and no countries are specified when defining importing settings
    // (which means the survey will be available to the specified permission group in all countries),
    // they need to have TUPAIA_ADMIN_PANEL_PERMISSION_GROUP to all countries.
    // NOTE: for existing surveys, we don't have to worry about this because when no countries are specified when importing existing surveys
    // the countries of the existing surveys will be kept the same.
    const allCountries = await models.country.find();
    const allCountryCodes = allCountries.map(c => c.code);

    if (!accessPolicy.allowsAll(allCountryCodes, TUPAIA_ADMIN_PANEL_PERMISSION_GROUP)) {
      throw new PermissionsError(
        `Need ${TUPAIA_ADMIN_PANEL_PERMISSION_GROUP} access to all countries if no countries are specified to import any new survey`,
      );
    }
  }

  if (survey) {
    // For existing surveys, check if the user has TUPAIA_ADMIN_PANEL_PERMISSION_GROUP
    // and also the survey permission group for the survey's countries.
    await assertCanImportExistingSurvey(accessPolicy, models, survey);
  }

  return true;
};
