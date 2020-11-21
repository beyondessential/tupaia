/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { QUERY_CONJUNCTIONS } from '@tupaia/database';

const { AND, RAW } = QUERY_CONJUNCTIONS;

export const findSurveysInCountry = async (
  models,
  countryId,
  criteria = {},
  options = {},
  findOrCount = 'find',
) =>
  models.survey[findOrCount](
    {
      ...criteria,
      [AND]: {
        [RAW]: {
          sql: `country_ids = '{}' OR ? = ANY(country_ids)`,
          parameters: [countryId],
        },
      },
    },
    options,
  );
