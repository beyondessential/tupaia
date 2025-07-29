import { keyBy } from 'es-toolkit/compat';

import { divideValues } from '/apiV1/dataBuilders/helpers';
import { fetchComposedData } from '/apiV1/measureBuilders/helpers';
import { getAggregatePeriod } from '/apiV1/utils';

/**
 * Configuration schema
 * @typedef {Object} composePercentagePerOrgUnitConfig
 * @property {{ numerator, denominator}} measureBuilders
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

export const composePercentagePerOrgUnit = async (
  models,
  aggregator,
  dhisApi,
  query,
  config,
  entity,
) => {
  const { fractionType } = config;
  const { dataElementCode } = query;

  const responses = await fetchComposedData(models, aggregator, dhisApi, query, config, entity);
  const { numerator, denominator } = responses;
  const numeratorsByOrgUnit = await keyBy(numerator.data, 'organisationUnitCode');
  const denominatorsByOrgUnit = await keyBy(denominator.data, 'organisationUnitCode');

  const fractionsByOrgUnit = {};
  Object.keys(numeratorsByOrgUnit).forEach(orgUnit => {
    const { [dataElementCode]: numeratorValue } = numeratorsByOrgUnit[orgUnit] || {};
    const { [dataElementCode]: denominatorValue } = denominatorsByOrgUnit[orgUnit] || {};

    const fraction = divideValues(numeratorValue, denominatorValue, fractionType);

    if (!isNaN(fraction)) {
      fractionsByOrgUnit[orgUnit] = {
        ...denominatorsByOrgUnit[orgUnit],
        [dataElementCode]: fraction,
        metadata: { numerator: numeratorValue, denominator: denominatorValue },
      };
    }
  });
  const period = getAggregatePeriod([numerator.period, denominator.period]);

  return { data: Object.values(fractionsByOrgUnit), period };
};
