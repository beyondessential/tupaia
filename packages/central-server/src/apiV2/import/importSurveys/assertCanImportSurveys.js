/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import { TUPAIA_ADMIN_PANEL_PERMISSION_GROUP } from '../../../permissions';

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

// FIXME: rename to canImportSurveyQuestions for clarity
export const assertCanImportSurveys = async (accessPolicy, models, surveyCodes) => {
  const surveys = await models.survey.find({
    code: surveyCodes,
  });
  for (const survey of surveys) {
    await assertCanImportExistingSurvey(accessPolicy, models, survey);
  }
  return true;
};
