/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

export const findEntitiesInCountry = async (
  models,
  countryId,
  criteria = {},
  options = {},
  findOrCount = 'find',
) => {
  const country = await models.country.findById(countryId);
  return models.entity[findOrCount](
    {
      ...criteria,
      country_code: country.code,
    },
    options,
  );
};
