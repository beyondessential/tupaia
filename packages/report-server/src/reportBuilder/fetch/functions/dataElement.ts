/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { Aggregator } from '../../../aggregator';
import { FetchReportQuery } from '../../../types';
import { FetchResponse } from '../types';

type DataElementFetchParams = {
  dataElementCodes: string[];
};

const fetchAnalytics = async (
  aggregator: Aggregator,
  query: FetchReportQuery,
  params: DataElementFetchParams,
): Promise<FetchResponse> => {
  const { organisationUnitCodes, period } = query;
  return aggregator.fetchAnalytics(params.dataElementCodes, organisationUnitCodes, period);
};

const buildParams = (params: unknown): DataElementFetchParams => {
  if (!Array.isArray(params)) {
    throw new Error(`Expected an array of data element codes but got ${params}`);
  }

  const nonStringDataElementCode = params.find(param => typeof param !== 'string');

  if (nonStringDataElementCode) {
    throw new Error(
      `Expected all data element codes to be strings, but got ${nonStringDataElementCode}`,
    );
  }

  return {
    dataElementCodes: params,
  };
};

export const buildDataElementFetch = (params: unknown) => {
  const builtDataElementsFetchParams = buildParams(params);
  return (aggregator: Aggregator, query: FetchReportQuery) =>
    fetchAnalytics(aggregator, query, builtDataElementsFetchParams);
};
