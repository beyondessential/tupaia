/**
 * Tupaia Config Server
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import keyBy from 'lodash.keyby';

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

export const composePercentagePerOrgUnit = async (
  aggregator,
  dhisApi,
  query,
  config,
  entity,
  processValues = value => value,
) => {
  const { fractionType } = config;
  const { dataElementCode } = query;

  const responses = await fetchComposedData(aggregator, dhisApi, query, config, entity);
  const { numerator, denominator } = responses;
  const numeratorsByOrgUnit = await processValues(keyBy(numerator, 'organisationUnitCode'));
  const denominatorsByOrgUnit = await processValues(keyBy(denominator, 'organisationUnitCode'));

  const fractionsByOrgUnit = {};
  Object.keys(numeratorsByOrgUnit).forEach(orgUnit => {
    const { [dataElementCode]: numeratorValue } = numeratorsByOrgUnit[orgUnit] || {};
    const { [dataElementCode]: denominatorValue } = denominatorsByOrgUnit[orgUnit] || {};
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

export const composePercentagePerAncestor = async (aggregator, dhisApi, query, config, entity) => {
  const { aggregationEntityType, dataSourceEntityType } = config;
  const sumToAncestor = async dataByOrgUnit => {
    if (
      !aggregationEntityType ||
      !dataSourceEntityType ||
      aggregationEntityType === dataSourceEntityType
    ) {
      return dataByOrgUnit;
    }
    const orgUnitToAncestor = await getOrgUnitToAncestorMap(
      Object.values(dataByOrgUnit).map(({ organisationUnitCode }) => organisationUnitCode),
      aggregationEntityType,
    );
    const summedData = {};
    Object.entries(dataByOrgUnit).forEach(([orgUnit, responseElement]) => {
      const organisationUnitCode = orgUnitToAncestor[orgUnit] || orgUnit;
      // If there are no matching response elements already being returned, add it
      if (!summedData[organisationUnitCode]) {
        summedData[organisationUnitCode] = {
          ...responseElement,
          value: responseElement.value,
          organisationUnitCode,
        };
      } else {
        summedData[organisationUnitCode].value += responseElement.value;
      }
    });
    return summedData;
  };
  return composePercentagePerOrgUnit(aggregator, dhisApi, query, config, entity, sumToAncestor);
};

const getOrgUnitToAncestorMap = async (orgUnitCodes, aggregationEntityType) => {
  const orgUnits = await Entity.find({
    code: orgUnitCodes,
  });
  if (!orgUnits || orgUnits.length === 0) {
    return {};
  }
  const orgUnitToAncestor = {};
  const addOrgUnitToMap = async orgUnit => {
    if (orgUnit) {
      const ancestor = await orgUnit.getAncestorOfType(aggregationEntityType);
      if (ancestor) orgUnitToAncestor[orgUnit.code] = ancestor.code;
    }
  };
  await Promise.all(orgUnits.map(orgUnit => addOrgUnitToMap(orgUnit)));
  return orgUnitToAncestor;
};
