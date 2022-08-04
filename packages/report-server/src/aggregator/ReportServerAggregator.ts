/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { Aggregator } from '@tupaia/aggregator';
import { yup } from '@tupaia/utils';

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

  private async getDateElementCodes(programCode: string, organisationUnitCodes: string[]) {
    console.log('before fetch Data Group:');
    const { dataElements } = (await this.aggregator.fetchDataGroup(programCode, {
      dataServices: [{ isDataRegional: false }],
      organisationUnitCodes,
    })) as EventMetaData;
    console.log('data elements from getDataElementCodes: ', dataElements);
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
    console.log('programCode', programCode);
    console.log('organisationUnitCodes', organisationUnitCodes);
    const noCodesInConfig = !dataElementCodesInConfig || dataElementCodesInConfig.length === 0;
    console.log('no codes in config: ', noCodesInConfig);
    const dataElementCodes =
      (noCodesInConfig && (await this.getDateElementCodes(programCode, organisationUnitCodes))) ||
      dataElementCodesInConfig;
    console.log('data element codes', dataElementCodes);
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
    const validator = yup.object().shape({
      dataElements: yup
        .array()
        .of(
          yup.object().shape({
            code: yup.string().required(),
            text: yup.string().required(),
          }),
        )
        .required(),
    });
    const result = await this.aggregator.fetchDataGroup(code, {});
    return validator.validateSync(result);
  }
}
