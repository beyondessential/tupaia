import {
  periodToTimestamp,
  reduceToDictionary,
  parsePeriodType,
  convertToPeriod,
  periodToDisplayString,
} from '@tupaia/utils';
import { DataBuilder } from '/apiV1/dataBuilders/DataBuilder';

export class AnalyticsPerPeriodBuilder extends DataBuilder {
  async build() {
    this.dataElementToSeriesKey = this.getDataElementToSeriesKey();
    const dataElementCodes = this.getRequestDataElementCodes();
    const { results } = await this.fetchAnalytics(dataElementCodes);
    const resultsPerPeriod = this.getResultsPerPeriod(results);

    return { data: Object.values(resultsPerPeriod) };
  }

  getRequestDataElementCodes() {
    return Object.keys(this.dataElementToSeriesKey);
  }

  getGroupingMapDataElementCodes(dataElement) {
    return this.dataElementToSeriesKey[dataElement];
  }

  getDataElementToSeriesKey() {
    const series = this.config.series || [
      { key: 'value', dataElementCode: this.config.dataElementCode },
    ];
    return reduceToDictionary(series, 'dataElementCode', 'key');
  }

  getResultsPerPeriod = (results = []) => {
    const configPeriodType = this.config.periodType
      ? parsePeriodType(this.config.periodType)
      : null;
    const resultsPerPeriod = {};
    results.forEach(result => {
      const { period, value, dataElement } = result;
      const convertPeriod = configPeriodType // Convert period to if configPeriodType is set (eg: period = '20200331', configPeriodType = 'MONTH' => convertPeriod = '202003')
        ? convertToPeriod(period, configPeriodType)
        : period;
      const seriesKey = this.getGroupingMapDataElementCodes(dataElement);
      if (!resultsPerPeriod[convertPeriod]) {
        resultsPerPeriod[convertPeriod] = {
          timestamp: periodToTimestamp(convertPeriod),
        };
        if (configPeriodType) {
          resultsPerPeriod[convertPeriod] = {
            name: periodToDisplayString(convertPeriod, configPeriodType),
          };
        }
      }
      resultsPerPeriod[convertPeriod][seriesKey] = value;
    });
    return resultsPerPeriod;
  };
}

export const analyticsPerPeriod = (
  { models, dataBuilderConfig, query, entity },
  aggregator,
  dhisApi,
) => {
  const { aggregationType } = dataBuilderConfig;
  const builder = new AnalyticsPerPeriodBuilder(
    models,
    aggregator,
    dhisApi,
    dataBuilderConfig,
    query,
    entity,
    aggregationType,
  );
  return builder.build();
};
