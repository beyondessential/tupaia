/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

export const checkCanImportSurveyResponses = async (
  accessPolicy,
  models,
  entitiesByPermissionGroup,
) => {
  for (let i = 0; i < Object.entries(entitiesByPermissionGroup).length; i++) {
    const [permissionGroup, entityCodes] = Object.entries(entitiesByPermissionGroup)[i];
    const entities = await models.entity.find({ code: entityCodes });
    const entityCountryCodes = entities.map(e => e.country_code);
    const countryCodes = [...new Set(entityCountryCodes)];
    if (!accessPolicy.allowsAll(countryCodes, permissionGroup)) {
      const countries = await models.country.find({ code: countryCodes });
      const countryNames = countries.map(c => c.name);
      const countryNamesString = countryNames.join(',');

      throw new Error(
        `Need ${permissionGroup} access to ${countryNamesString} to import the survey responses`,
      );
    }
  }

  return true;
};
