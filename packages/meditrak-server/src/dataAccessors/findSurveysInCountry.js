/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { QUERY_CONJUNCTIONS } from '@tupaia/database';
const { RAW } = QUERY_CONJUNCTIONS;

export const findSurveysInCountry = async (models, criteria = {}, options = {}) => {
  const { countryId, ...restOfCriteria } = criteria;
  if (countryId) {
    return models.survey.find({
      ...restOfCriteria,
      [RAW]: {
        sql: `country_ids = '{}' OR ? = ANY(country_ids)`,
        parameters: [countryId],
      },
    });
  }
  // simple find
  return models.survey.find(restOfCriteria, options);
};
