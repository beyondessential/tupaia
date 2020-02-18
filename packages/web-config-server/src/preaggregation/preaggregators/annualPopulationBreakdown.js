/**
 * Tupaia Config Server
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import get from 'lodash.get';
import has from 'lodash.has';
import setWith from 'lodash.setwith';
import winston from 'winston';

import { postDataValueSets } from '/preaggregation/postDataValueSets';
import { runPreaggregationOnAllDhisInstances } from '/preaggregation/runPreaggregationOnAllDhisInstances';

/**
 * Map of POP01 to POP04 survey element codes for data elements that overlap each other
 */
const POP_01_TO_POP_04_CODES = {
  POP16: 'POP16AND18',
  POP18: 'POP16AND18',
  POP17: 'POP17AND19',
  POP19: 'POP17AND19',
  POP20: 'POP20AND22',
  POP22: 'POP20AND22',
  POP21: 'POP21AND23',
  POP23: 'POP21AND23',
  POP24: 'POP24AND26',
  POP26: 'POP24AND26',
  POP25: 'POP25AND27',
  POP27: 'POP25AND27',
  POP28: 'POP28AND30',
  POP30: 'POP28AND30',
  POP29: 'POP29AND31',
  POP31: 'POP29AND31',
  POP32: 'POP3234AND36',
  POP34: 'POP3234AND36',
  POP36: 'POP3234AND36',
  POP33: 'POP3335AND37',
  POP35: 'POP3335AND37',
  POP37: 'POP3335AND37',
};

const POP_01_CODES = Object.keys(POP_01_TO_POP_04_CODES);

/**
 * POP04 and POP01 are both Annual Population Breakdown surveys,
 * which contain some data elements whose data overlap each other.
 *
 * For example, in POP01:
 * POP16: 'Annual Population: 30-34 years male'
 * POP18: 'Annual Population: 35-39 years male'
 * And in POP04:
 * POP16AND18: 'Annual Population: 30-39 years male'
 *
 * This aggregation converts all overlapping elements from POP01 to POP04,
 * so that POP04 can be the single source of truth in data aggregations.
 *
 * @param {DhisApi} dhisApi
 */
export const annualPopulationBreakdown = async (aggregator, dhisApi) => {
  winston.info('Starting to aggregate Annual Population Breakdown');
  runPreaggregationOnAllDhisInstances(runPreaggregation, aggregator, dhisApi);
};

const runPreaggregation = async (aggregator, dhisApi) => {
  const { results } = await dhisApi.getAnalytics(
    {
      dataElementCodes: POP_01_CODES,
      organisationUnitCode: 'World',
      outputIdScheme: 'code',
    },
    {},
    aggregator.aggregationTypes.FINAL_EACH_YEAR,
  );

  const dataValues = createAggregatedDataValues(results);
  await postDataValueSets(dhisApi, dataValues);
};

const createAggregatedDataValues = apiResults => {
  // Values by dataElementCode, organisationUnitId and period
  const valueMap = {};

  apiResults.forEach(resultItem => {
    const {
      dataElement: pop01Code,
      organisationUnit: organisationUnitId,
      period,
      value,
    } = resultItem;
    const pop04Code = POP_01_TO_POP_04_CODES[pop01Code];

    const itemPath = [pop04Code, organisationUnitId, period];
    if (has(valueMap, itemPath)) {
      get(valueMap, itemPath).value += value;
    } else {
      const newItem = {
        dataElement: pop04Code,
        orgUnit: organisationUnitId,
        period,
        value,
      };

      setWith(valueMap, itemPath, newItem, Object);
    }
  });

  const dataValues = [];
  Object.values(valueMap).forEach(elementData => {
    Object.values(elementData).forEach(organisationUnitData => {
      dataValues.push(...Object.values(organisationUnitData));
    });
  });

  return dataValues;
};
