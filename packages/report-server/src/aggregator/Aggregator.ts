/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { Aggregator as BaseAggregator } from '@tupaia/aggregator';

import { Aggregation, Event, PeriodParams } from '../types';

export class Aggregator extends BaseAggregator {
  aggregationToAggregationConfig = (aggregation: Aggregation) =>
    typeof aggregation === 'string'
      ? {
          type: aggregation,
        }
      : aggregation;

  async fetchAnalytics(
    dataElementCodes: string[],
    aggregationList: Aggregation[] | undefined,
    organisationUnitCodes: string[],
    hierarchy: string | undefined,
    periodParams: PeriodParams,
  ) {
    const { period, startDate, endDate } = periodParams;
    const aggregations = aggregationList
      ? aggregationList.map(this.aggregationToAggregationConfig)
      : [{ type: 'RAW' }];

    return super.fetchAnalytics(
      dataElementCodes,
      {
        organisationUnitCodes,
        hierarchy,
        period,
        startDate,
        endDate,
        detectDataServices: true,
      },
      { aggregations },
    );
  }

  async fetchEvents(
    programCode: string,
    aggregationList: Aggregation[] | undefined,
    organisationUnitCodes: string[],
    hierarchy: string | undefined,
    periodParams: PeriodParams,
    dataElementCodes?: string[],
  ): Promise<Event[]> {
    const { period, startDate, endDate } = periodParams;
    const aggregations = aggregationList
      ? aggregationList.map(this.aggregationToAggregationConfig)
      : [{ type: 'RAW' }];
    return super.fetchEvents(
      programCode,
      {
        organisationUnitCodes,
        hierarchy,
        dataElementCodes,
        period,
        startDate,
        endDate,
        detectDataServices: true,
      },
      { aggregations },
    );
  }
}
