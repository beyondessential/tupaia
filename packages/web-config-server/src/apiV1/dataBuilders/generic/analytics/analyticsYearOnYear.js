import { periodToMoment } from '@tupaia/tsutils';
import { reduceToDictionary } from '@tupaia/utils';
import moment from 'moment';
import { AnalyticsPerPeriodBuilder } from './analyticsPerPeriod';
import { formatLayeredDataElementCode, layerYearOnYear } from '../../../utils/layerYearOnYear';

class AnalyticsYearOnYearBuilder extends AnalyticsPerPeriodBuilder {
  async fetchAnalytics(
    dataElementCodes,
    additionalQueryConfig,
    aggregationType = this.aggregationType,
    aggregationConfig = this.config.aggregationConfig ?? {},
  ) {
    const originalStartDate = this.query.startDate;
    const originalEndDate = this.query.endDate;

    this.query.endDate = this.getDataEndDate().format('YYYY-MM-DD');
    this.query.startDate = this.getDataStartDate().format('YYYY-MM-DD');

    const response = await super.fetchAnalytics(
      dataElementCodes,
      additionalQueryConfig,
      aggregationType,
      aggregationConfig,
    );

    const layeredAnalytics = layerYearOnYear(response.results);
    response.results = this.filterLayeredAnalytics(
      originalStartDate,
      originalEndDate,
      layeredAnalytics,
    );

    this.query.startDate = originalStartDate;
    this.query.endDate = originalEndDate;

    return response;
  }

  filterLayeredAnalytics(originalStartDate, originalEndDate, layeredAnalytics) {
    const filteredAnalytics = layeredAnalytics.filter(layeredAnalytic => {
      const formattedAnalyticPeriod = periodToMoment(layeredAnalytic.period).format('YYYY-MM-DD');
      return moment(formattedAnalyticPeriod).isBetween(originalStartDate, originalEndDate);
    });
    return filteredAnalytics;
  }

  getDataEndDate() {
    return moment();
  }

  getDataStartDate() {
    return moment()
      .subtract(this.config.layerYearOnYearSeries.yearRange - 1, 'years')
      .month('january')
      .date(1);
  }

  getLayerYearOnYearSeries() {
    const series = [];
    for (let year = this.getDataEndDate().year(); year >= this.getDataStartDate().year(); year--) {
      const yearsAgo = this.getDataEndDate().year() - year;
      series.push({
        seriesKey: year,
        dataElementCode: formatLayeredDataElementCode(this.config.dataElementCode, yearsAgo),
      });
    }
    return series;
  }

  getGroupingMapDataElementCodes(layeredDataElementCode) {
    const series = this.getLayerYearOnYearSeries();
    const dataElementMap = reduceToDictionary(series, 'dataElementCode', 'seriesKey');

    return dataElementMap[layeredDataElementCode];
  }
}
export const analyticsYearOnYear = (
  { models, dataBuilderConfig, query, entity },
  aggregator,
  dhisApi,
) => {
  const { aggregationType } = dataBuilderConfig;
  const builder = new AnalyticsYearOnYearBuilder(
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
