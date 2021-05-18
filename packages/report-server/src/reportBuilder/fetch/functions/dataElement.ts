/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { Aggregator } from '../../../aggregator';
import { FetchReportQuery } from '../../../types';
import { FetchResponse } from '../types';

type DataElementParams = {
  dataElements: unknown;
  aggregations?: unknown;
};

type DataElementFetchParams = {
  dataElementCodes: string[];
  aggregations?: string[];
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

function validateDataElements(dataElements: unknown): asserts dataElements is string[] {
  if (!Array.isArray(dataElements)) {
    throw new Error(`Expected an array of data element codes but got ${dataElements}`);
  }

  const nonStringDataElementCode = dataElements.find(param => typeof param !== 'string');
  if (nonStringDataElementCode) {
    throw new Error(
      `Expected all data element codes to be strings, but got ${nonStringDataElementCode}`,
    );
  }
}

function validateAggregations(aggregations: unknown): asserts aggregations is undefined | string[] {
  if (aggregations !== undefined && !Array.isArray(aggregations)) {
    throw new Error(`Expected an array of aggregations but got ${aggregations}`);
  }
  if (aggregations !== undefined && !aggregations.every(a => typeof a === 'string')) {
    throw new Error(`Expected all aggregations to be an array of strings`);
  }
}

export const buildDataElementFetch = (params: DataElementParams) => {
  const builtDataElementsFetchParams = buildParams(params);
  return (aggregator: Aggregator, query: FetchReportQuery) =>
    fetchAnalytics(aggregator, query, builtDataElementsFetchParams);
};
