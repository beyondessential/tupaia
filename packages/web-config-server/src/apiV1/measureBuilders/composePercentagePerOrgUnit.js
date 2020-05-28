/**
 * Tupaia Config Server
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import groupBy from 'lodash.groupby';

import { divideValues } from '/apiV1/dataBuilders/helpers';
import { fetchComposedData } from '/apiV1/measureBuilders/helpers';
import { Entity } from '/models';

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

export const composePercentagePerOrgUnit = async (aggregator, dhisApi, query, config, entity) => {
  const { fractionType } = config;
  const { dataElementCode } = query;

  const responses = await fetchComposedData(aggregator, dhisApi, query, config, entity);
  console.log(responses);
  const numeratorsByOrgUnit = groupBy(responses.numerator, 'organisationUnitCode');
  const denominatorsByOrgUnit = groupBy(responses.denominator, 'organisationUnitCode');

  const fractionsByOrgUnit = {};
  Object.keys(numeratorsByOrgUnit).forEach(orgUnit => {
    const { [dataElementCode]: numeratorValue } =
      sumMeasureData(numeratorsByOrgUnit[orgUnit]) || {};
    const { [dataElementCode]: denominatorValue } =
      sumMeasureData(denominatorsByOrgUnit[orgUnit]) || {};

    const fraction = divideValues(numeratorValue, denominatorValue, fractionType);

    // eslint-disable-next-line no-restricted-globals
    if (!isNaN(fraction)) {
      fractionsByOrgUnit[orgUnit] = {
        ...denominatorsByOrgUnit[orgUnit],
        [dataElementCode]: fraction,
        metadata: { numerator: numeratorValue, denominator: denominatorValue },
      };
    }
  });

  return Object.values(fractionsByOrgUnit);
};

const sumMeasureData = measureData => {
  if (!measureData) return null;
  let summedValue = 0;
  measureData.forEach(({ value }) => {
    summedValue += value;
  });
  return { ...measureData[0], value: summedValue };
};
