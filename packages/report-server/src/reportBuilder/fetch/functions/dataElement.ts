/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { Aggregator } from '../../../aggregator';
import { FetchReportQuery } from '../../../types';
import { FetchResponse } from '../types';

type DataElementParams = {
  dataElements: unknown;
};

type DataElementFetchParams = {
  dataElementCodes: string[];
};

const fetchAnalytics = async (
  aggregator: Aggregator,
  query: FetchReportQuery,
  params: DataElementFetchParams,
): Promise<FetchResponse> => {
  const { organisationUnitCodes, period, startDate, endDate } = query;
  return aggregator.fetchAnalytics(params.dataElementCodes, organisationUnitCodes, {
    period,
    startDate,
    endDate,
  });
};

const buildParams = (params: DataElementParams): DataElementFetchParams => {
  const { dataElements } = params;
  validateDataElements(dataElements);

  return {
    dataElementCodes: dataElements,
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

export const buildDataElementFetch = (params: DataElementParams) => {
  const builtDataElementsFetchParams = buildParams(params);
  return (aggregator: Aggregator, query: FetchReportQuery) =>
    fetchAnalytics(aggregator, query, builtDataElementsFetchParams);
};
