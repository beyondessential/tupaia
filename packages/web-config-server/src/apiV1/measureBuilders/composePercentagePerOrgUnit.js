/**
 * Tupaia Config Server
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import keyBy from 'lodash.keyby';

import { divideValues } from '/apiV1/dataBuilders/helpers';
import { fetchComposedData } from '/apiV1/measureBuilders/helpers';

/**
 * Configuration schema
 * @typedef {Object} composePercentagePerOrgUnitConfig
 * @property {{ numerator: DataBuilder, denominator: DataBuilder}} dataBuilders
 *
 * Example
 * ```js
 * {
 *   measureBuilders: {
 *     numerator: {
 *       measureBuilder: 'countEventsPerOrgUnit',
 *       measureBuilderConfig: {
 *         dataValues: { CD92: 'Measles' },
 *         programCode: 'CD8'
 *       }
 *     },
 *     denominator: {
 *       measureBuilder: 'sumLatestPerOrgUnit',
 *       measureBuilderConfig: {
 *         dataSource: { type: 'single', codes: ['POP01', 'POP02'] }
 *       }
 *     }
 *   }
 * }
 * ```
 */

export const composePercentagePerOrgUnit = async (aggregator, dhisApi, query, config) => {
  const { fractionType } = config;
  const { dataElementCode } = query;

  const responses = await fetchComposedData(aggregator, dhisApi, query, config);
  const numeratorsByOrgUnit = keyBy(responses.numerator, 'organisationUnitCode');
  const denominatorsByOrgUnit = keyBy(responses.denominator, 'organisationUnitCode');

  const fractionsByOrgUnit = {};
  Object.keys(denominatorsByOrgUnit).forEach(orgUnit => {
    const numeratorValue = numeratorsByOrgUnit[orgUnit][dataElementCode];
    const denominatorValue = denominatorsByOrgUnit[orgUnit][dataElementCode];
    const fraction = divideValues(numeratorValue, denominatorValue, fractionType);

    // eslint-disable-next-line no-restricted-globals
    if (!isNaN(fraction)) {
      fractionsByOrgUnit[orgUnit] = {
        ...denominatorsByOrgUnit[orgUnit],
        [dataElementCode]: fraction,
      };
    }
  });

  return Object.values(fractionsByOrgUnit);
};
