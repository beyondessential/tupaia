/**
 * Tupaia Config Server
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */
import keyBy from 'lodash.keyby';
import { DataBuilder } from '/apiV1/dataBuilders/DataBuilder';
import { AGGREGATION_TYPES } from '/dhis';
import { periodToTimestamp } from '/dhis/periodTypes';

const { FINAL_EACH_DAY, FINAL_EACH_MONTH, FINAL_EACH_YEAR } = AGGREGATION_TYPES;

class FinalValuesPerPeriodBuilder extends DataBuilder {
  async build() {
    const { series } = this.config;
    const seriesByDataElementCode = keyBy(series, 'dataElementCode');
    const dataElementCodes = Object.keys(seriesByDataElementCode);
    const { results, metadata } = await this.getAnalytics({ dataElementCodes });
    if (results.length === 0) return { data: results };

    const { dataElementIdToCode } = metadata;
    const resultsPerPeriod = {};
    results.forEach(result => {
      const { period, value, dataElement } = result;
      const { key: seriesKey } = seriesByDataElementCode[dataElementIdToCode[dataElement]];
      if (!resultsPerPeriod[period]) {
        resultsPerPeriod[period] = { timestamp: periodToTimestamp(period) };
      }
      resultsPerPeriod[period][seriesKey] = value;
    });
    return { data: Object.values(resultsPerPeriod) };
  }
}

function finalValuesPerPeriod(queryConfig, dhisApi, aggregationType) {
  const { dataBuilderConfig, query, entity } = queryConfig;
  const builder = new FinalValuesPerPeriodBuilder(
    dhisApi,
    dataBuilderConfig,
    query,
    entity,
    aggregationType,
  );
  return builder.build();
}

export const finalValuesPerDay = async (queryConfig, dhisApi) =>
  finalValuesPerPeriod(queryConfig, dhisApi, FINAL_EACH_DAY);

export const finalValuesPerMonth = async (queryConfig, dhisApi) =>
  finalValuesPerPeriod(queryConfig, dhisApi, FINAL_EACH_MONTH);

export const finalValuesPerYear = async (queryConfig, dhisApi) =>
  finalValuesPerPeriod(queryConfig, dhisApi, FINAL_EACH_YEAR);
