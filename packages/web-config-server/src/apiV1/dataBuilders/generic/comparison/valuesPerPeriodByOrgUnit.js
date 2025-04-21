import { periodToDisplayString, periodToTimestamp } from '@tupaia/utils';
import { DataBuilder } from '/apiV1/dataBuilders/DataBuilder';

class ValuesPerPeriodByOrgUnitBuilder extends DataBuilder {
  async build() {
    const { dataElementCodes, includeTotal } = this.config;
    const { results, period } = await this.fetchAnalytics(dataElementCodes);
    if (results.length === 0) return { data: results };

    const resultsPerPeriod = {};
    results.forEach(result => {
      const { period, value, organisationUnit } = result;

      resultsPerPeriod[period] = { ...resultsPerPeriod[period], [organisationUnit]: value };
    });

    if (includeTotal) {
      Object.entries(resultsPerPeriod).forEach(([key, data]) => {
        const total = Object.values(data).reduce((count, dataValue) => count + dataValue, 0);
        resultsPerPeriod[key].total = total;
      });
    }

    const data = Object.entries(resultsPerPeriod).reduce((previousData, [period, periodData]) => {
      previousData.push({
        name: periodToDisplayString(period),
        timestamp: periodToTimestamp(period),
        ...periodData,
      });
      return previousData;
    }, []);

    return { data, period };
  }
}

function valuesPerPeriodByOrgUnit(queryConfig, aggregator, dhisApi, aggregationType) {
  const { models, dataBuilderConfig, query, entity } = queryConfig;
  const builder = new ValuesPerPeriodByOrgUnitBuilder(
    models,
    aggregator,
    dhisApi,
    dataBuilderConfig,
    query,
    entity,
    aggregationType,
  );
  return builder.build();
}

export const sumPreviousValuesPerDayByOrgUnit = async (queryConfig, aggregator, dhisApi) =>
  valuesPerPeriodByOrgUnit(
    queryConfig,
    aggregator,
    dhisApi,
    aggregator.aggregationTypes.SUM_PREVIOUS_EACH_DAY,
  );

export const sumValuesPerQuarterByOrgUnit = async (queryConfig, aggregator, dhisApi) =>
  valuesPerPeriodByOrgUnit(
    queryConfig,
    aggregator,
    dhisApi,
    aggregator.aggregationTypes.SUM_EACH_QUARTER,
  );

export const finalValuesPerQuarterByOrgUnit = async (queryConfig, aggregator, dhisApi) =>
  valuesPerPeriodByOrgUnit(
    queryConfig,
    aggregator,
    dhisApi,
    aggregator.aggregationTypes.FINAL_EACH_QUARTER,
  );
