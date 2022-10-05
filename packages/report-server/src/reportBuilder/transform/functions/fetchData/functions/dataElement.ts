/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { yup } from '@tupaia/utils';

import { ReportServerAggregator } from '../../../../../aggregator';
import { Aggregation, FetchReportQuery } from '../../../../../types';
import { FetchConfig, FetchResponse } from '../types';

type DataElementParams = Pick<FetchConfig, 'dataElements' | 'aggregations'>;

type DataElementFetchParams = {
  dataElementCodes: string[];
  aggregations?: Aggregation[];
};

const dataElementsValidator = yup.array().of(yup.string().required()).min(1).required();

const fetchAnalytics = async (
  aggregator: ReportServerAggregator,
  query: FetchReportQuery,
  params: DataElementFetchParams,
): Promise<FetchResponse> => {
  const { organisationUnitCodes, hierarchy, period, startDate, endDate } = query;
  return aggregator.fetchAnalytics(
    params.dataElementCodes,
    params.aggregations,
    organisationUnitCodes,
    hierarchy,
    {
      period,
      startDate,
      endDate,
    },
  );
};

const buildParams = (params: DataElementParams): DataElementFetchParams => {
  const { dataElements, aggregations } = params;

  return {
    dataElementCodes: dataElementsValidator.validateSync(dataElements),
    aggregations,
  };
};

export const buildDataElementFetch = (params: DataElementParams) => {
  const builtDataElementsFetchParams = buildParams(params);
  return (aggregator: ReportServerAggregator, query: FetchReportQuery) =>
    fetchAnalytics(aggregator, query, builtDataElementsFetchParams);
};
