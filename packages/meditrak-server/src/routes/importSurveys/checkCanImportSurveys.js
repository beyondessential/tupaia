/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import { TUPAIA_ADMIN_PANEL_PERMISSION_GROUP } from '../../permissions';

export const checkCanImportSurveys = async (accessPolicy, models, surveyNames, newCountryIds) => {
  //If countries are selected when import surveys, it will update the country_ids of the survey
  //So we need to check if the user has TUPAIA_ADMIN_PANEL_PERMISSION_GROUP to the new specified countries for the surveys
  if (newCountryIds) {
    const newCountries = await models.country.find({
      id: newCountryIds,
    });
    const newCountryCodes = newCountries.map(c => c.code);

    if (!accessPolicy.allowsAll(newCountryCodes, TUPAIA_ADMIN_PANEL_PERMISSION_GROUP)) {
      const newCountryNames = newCountries.map(c => c.name);
      const newCountryNamesString = newCountryNames.join(',');

      throw new Error(
        `Need ${TUPAIA_ADMIN_PANEL_PERMISSION_GROUP} access to ${newCountryNamesString} to import the surveys`,
      );
    }
  } else if (!accessPolicy.allowsSome(null, TUPAIA_ADMIN_PANEL_PERMISSION_GROUP)) {
    //if no countryIds is specified (which means the survey will be public to all countries),
    //need to have TUPAIA_ADMIN_PANEL_PERMISSION_GROUP at least to 1 country
    throw new Error(`Need ${TUPAIA_ADMIN_PANEL_PERMISSION_GROUP} access to import the surveys`);
  }

  const surveys = await models.survey.find({
    name: surveyNames,
  });

  //For existing surveys, check if the user has TUPAIA_ADMIN_PANEL_PERMISSION_GROUP
  //and also the survey permission group for the survey's countries.
  for (const survey of surveys) {
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
  }

  return true;
};
