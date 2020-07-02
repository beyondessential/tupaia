/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import { QUERY_CONJUNCTIONS } from '@tupaia/database';
const { RAW } = QUERY_CONJUNCTIONS;

export const findEntitiesInCountry = async (
  models,
  countryId,
  criteria = {},
  options = {},
  findOrCount = 'find',
) => {
  const country = await models.country.findById(countryId);
  const { type, ...otherCriteria } = criteria;
  const dbConditions = {
    ...otherCriteria,
    country_code: country.code,
  };

  if (type) {
    const { comparator, comparisonValue } = type;
    dbConditions[RAW] = {
      sql: `type::text ${comparator} ?`,
      parameters: [comparisonValue],
    };
  }

  return models.entity[findOrCount](dbConditions, options);
};
