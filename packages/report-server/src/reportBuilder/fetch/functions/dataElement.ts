/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { Aggregator } from '../../../aggregator';
import { Aggregation, FetchReportQuery } from '../../../types';
import { FetchResponse } from '../types';
import {
  validateDataElementsForAnalytics as validateDataElements,
  validateAggregations,
} from './helpers';

type DataElementParams = {
  dataElements: unknown;
  aggregations?: unknown;
};

type DataElementFetchParams = {
  dataElementCodes: string[];
  aggregations?: Aggregation[];
};

const fetchAnalytics = async (
  aggregator: Aggregator,
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
  validateDataElements(dataElements);
  validateAggregations(aggregations);

  return {
    dataElementCodes: dataElements,
    aggregations,
  };
};

export const buildDataElementFetch = (params: DataElementParams) => {
  const builtDataElementsFetchParams = buildParams(params);
  return (aggregator: Aggregator, query: FetchReportQuery) =>
    fetchAnalytics(aggregator, query, builtDataElementsFetchParams);
};
