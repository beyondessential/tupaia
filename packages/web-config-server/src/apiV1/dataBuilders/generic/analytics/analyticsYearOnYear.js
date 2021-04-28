/**
 * Tupaia Config Server
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import { formatLayeredDataElementCode, layerYearOnYear } from '../../../utils/layerYearOnYear';
import { AnalyticsPerPeriodBuilder } from './analyticsPerPeriod';
import { periodToMoment, reduceToDictionary } from '@tupaia/utils';
import moment from 'moment';

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
    // console.log(response.results);

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
  // @TODO - name this method
  // this will need return to the original start/end dates as it is changed during laterYearOnYear to jan 01 - dec 31
  filterLayeredAnalytics(originalStartDate, originalEndDate, layeredAnalytics) {
    let filteredAnalytics = layeredAnalytics.filter(layeredAnalytic => {
      let analytic = periodToMoment(layeredAnalytic.period);
      analytic = analytic.format('YYYY-MM-DD');
      return moment(analytic).isBetween(originalStartDate, originalEndDate); // true
    });
    return filteredAnalytics;
    //within the range return true @TODO
  }

  getDataEndDate() {
    return moment();
  }

  getDataStartDate() {
    return moment(this.query.startDate)
      .subtract(this.config.layerYearOnYearSeries.pastYears, 'years')
      .month('january')
      .date(1);
  }

  getLayerYearOnYearSeries() {
    let series = [];
    for (let year = this.getDataEndDate().year(); year >= this.getDataStartDate().year(); year--) {
      let yearsAgo = this.getDataEndDate().year() - year;
      series.push({
        seriesKey: year,
        dataElementCode: formatLayeredDataElementCode(this.config.dataElementCode, yearsAgo),
      });
    }
    return series;
  }

  getGroupingMapDataElementCodes(layeredDataElementCode) {
    const series = this.getLayerYearOnYearSeries(layeredDataElementCode);
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

// @TODO
// date picker limits, FE task & default date range
// zooming
