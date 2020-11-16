import { Aggregator } from '../../../aggregator';
import { FetchReportQuery } from '../../../types';
import { FetchResponse } from '../types';

type DataElementsFetchParams = {
  dataElementCodes: string[];
};

const fetchAnalytics = async (
  aggregator: Aggregator,
  query: FetchReportQuery,
  params: DataElementsFetchParams,
): Promise<FetchResponse> => {
  const { organisationUnitCode } = query;
  const response = await aggregator.fetchAnalytics(
    params.dataElementCodes,
    {
      dataServices: [{ isDataRegional: true }],
      organisationUnitCodes: [organisationUnitCode],
    },
    {},
    {
      aggregationType: 'RAW',
    },
  );
  return response;
};

const buildParams = (params: unknown): DataElementsFetchParams => {
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
