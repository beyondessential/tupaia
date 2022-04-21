/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { Aggregator } from '@tupaia/aggregator';

import { Aggregation, Event, PeriodParams, EventMetaData } from '../types';

const aggregationToAggregationConfig = (aggregation: Aggregation) =>
  typeof aggregation === 'string'
    ? {
        type: aggregation,
      }
    : aggregation;

export class ReportServerAggregator {
  private aggregator: Aggregator;

  public constructor(aggregator: Aggregator) {
    this.aggregator = aggregator;
  }

  public async fetchAnalytics(
    dataElementCodes: string[],
    aggregationList: Aggregation[] | undefined,
    organisationUnitCodes: string[],
    hierarchy: string | undefined,
    periodParams: PeriodParams,
  ) {
    const { period, startDate, endDate } = periodParams;
    const aggregations = aggregationList
      ? aggregationList.map(aggregationToAggregationConfig)
      : [{ type: 'RAW' }];

    return this.aggregator.fetchAnalytics(
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

  private async getDateElementCodes(programCode: string) {
    const { dataElements } = (await this.aggregator.fetchDataGroup(
      programCode,
      {},
    )) as EventMetaData;
    return dataElements.map(({ code }) => code);
  }

  public async fetchEvents(
    programCode: string,
    aggregationList: Aggregation[] | undefined,
    organisationUnitCodes: string[],
    hierarchy: string | undefined,
    periodParams: PeriodParams,
    dataElementCodesInConfig?: string[],
  ): Promise<Event[]> {
    const { period, startDate, endDate } = periodParams;

    const noCodesInConfig = !dataElementCodesInConfig || dataElementCodesInConfig.length === 0;
    const dataElementCodes =
      (noCodesInConfig && (await this.getDateElementCodes(programCode))) ||
      dataElementCodesInConfig;

    const aggregations = aggregationList
      ? aggregationList.map(aggregationToAggregationConfig)
      : [{ type: 'RAW' }];
    return this.aggregator.fetchEvents(
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

  public async fetchDataGroup(code: string) {
    return this.aggregator.fetchDataGroup(code, {});
  }
}
