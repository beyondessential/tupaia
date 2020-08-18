/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import { TUPAIA_ADMIN_PANEL_PERMISSION_GROUP } from '../constants';

export const hasSurveysImportPermissions = async (
  accessPolicy,
  models,
  surveyNames,
  newCountryIds,
) => {
  //If countries are selected when import surveys, it will update the country_ids of the survey
  //So we need to check if the user has TUPAIA_ADMIN_PANEL_PERMISSION_GROUP to the new specified countries for the surveys
  if (newCountryIds) {
    const newCountries = await models.country.find({
      id: newCountryIds,
    });
    const newCountryEntities = await models.entity.find({
      code: newCountries.map(newCountry => newCountry.code),
    });
    const newCountryEntityCodes = newCountryEntities.map(newCountryEntity => newCountryEntity.code);

    if (!accessPolicy.allowsSome(newCountryEntityCodes, TUPAIA_ADMIN_PANEL_PERMISSION_GROUP)) {
      throw new Error("Insufficient permissions to the surveys' countries");
    }
  } else if (!accessPolicy.allowsSome(null, TUPAIA_ADMIN_PANEL_PERMISSION_GROUP)) {
    //if no countryIds is specified (which means the survey will be public to all countries),
    //need to have TUPAIA_ADMIN_PANEL_PERMISSION_GROUP at least to 1 country
    throw new Error("Insufficient permissions to the surveys' countries");
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
    const surveyCountryEntities = await models.entity.find({
      code: surveyCountries.map(surveyCountry => surveyCountry.code),
    });
    const surveyPermissionGroup = await models.permissionGroup.findOne({
      id: survey.permission_group_id,
    });
    const surveyCountryEntityCodes = surveyCountryEntities.map(
      surveyCountryEntity => surveyCountryEntity.code,
    );

    if (
      !accessPolicy.allowsSome(surveyCountryEntityCodes, surveyPermissionGroup.name) ||
      !accessPolicy.allowsSome(surveyCountryEntityCodes, TUPAIA_ADMIN_PANEL_PERMISSION_GROUP)
    ) {
      throw new Error(`Insufficient permissions to import survey ${survey.name}`);
    }
  }

  return true;
};
