/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import flattenDeep from 'lodash.flattendeep';

export const assertCanImportSurveyResponses = async (
  accessPolicy,
  models,
  entitiesByPermissionGroup,
) => {
  const allEntityCodes = flattenDeep(Object.values(entitiesByPermissionGroup));
  const allEntities = await models.entity.findManyByColumn('code', allEntityCodes);

  for (let i = 0; i < Object.entries(entitiesByPermissionGroup).length; i++) {
    const [permissionGroup, entityCodes] = Object.entries(entitiesByPermissionGroup)[i];
    const entities = allEntities.filter(e => entityCodes.includes(e.code));
    const entityCountryCodes = entities.map(e => e.country_code);
    const countryCodes = [...new Set(entityCountryCodes)];

    if (!accessPolicy.allowsAll(countryCodes, permissionGroup)) {
      const countries = await models.country.findManyByColumn('code', countryCodes);
      const countryNames = countries.map(c => c.name);
      const countryNamesString = countryNames.join(',');

      throw new Error(
        `Need ${permissionGroup} access to ${countryNamesString} to import the survey responses`,
      );
    }
  }

  return true;
};
