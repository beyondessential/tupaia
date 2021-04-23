/**
 * Tupaia Config Server
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import { layerYearOnYear } from '../../../utils/layerYearOnYear';
import { AnalyticsPerPeriodBuilder } from './analyticsPerPeriod';
import { reduceToDictionary } from '@tupaia/utils';

class AnalyticsYearOnYearBuilder extends AnalyticsPerPeriodBuilder {
  // modify query on class before calling fetch analytics

  // "method signature", "super method"
  async fetchAnalytics(
    dataElementCodes,
    additionalQueryConfig,
    aggregationType = this.aggregationType,
    aggregationConfig = this.config.aggregationConfig ?? {},
  ) {
    // store the original start/end dates

    const originalStartDate = this.query.startDate;
    const originalEndDate = this.query.endDate;
    // this is always going to latest year jan 01 (default)

    /// intercept/overrride the change the start date by the shift amoutn YYYY-MM-DD

    //
    this.query.startDate = '2016-01-01';
    // data from the first day of 2016 || four years from today's date..

    // end date?
    this.query.endDate = '2021-04-22';
    //moment().format('YYYY-MM-DD')
    // call original fetchAnalytics

    const response = await super.fetchAnalytics(
      dataElementCodes,
      additionalQueryConfig,
      aggregationType,
      aggregationConfig,
    );

    // once w have response, we need to do the layers of year on year
    // layerYearOnYear util/library function

    const layeredAnalytics = layerYearOnYear(response.results);

    response.results = layeredAnalytics;

    this.query.startDate = originalStartDate;
    this.query.endDate = originalEndDate;
    return response;

    /// deal with how analyticsPerPeiod deals with data element codes

    // date picker limits, FE task
  }

  // '2021W51': { name: '20th Dec 2021', undefined: 3 },

  getGroupingMapDataElementCodes(layeredDataElementCode) {
    // layeredDataElementCode latest- {3}

    const series = this.config.layerYearOnYearSeries;

    // || [
    //   { seriesKey: layeredDataElementCode, dataElementCode: layeredDataElementCode,
    //    },
    // ];
    const dataElementMap = reduceToDictionary(series, 'dataElementCode', 'seriesKey');

    return dataElementMap[layeredDataElementCode];

    // let prefix = dataElementName;

    // const series = this.config.series || [
    //   { key: 'value', dataElementCode: this.config.dataElementCode },
    // ];
    /// this is where the values becomes the renamed data element codes  (make a map withe prefixed dec)
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
