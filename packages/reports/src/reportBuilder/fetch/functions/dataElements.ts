import { Aggregator } from '../../../aggregator';
import { FetchReportQuery } from '../../../routes/types';
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
  const response = (await aggregator.fetchAnalytics(
    params.dataElementCodes,
    {
      dataServices: [{ isDataRegional: true }],
      organisationUnitCodes: [organisationUnitCode],
    },
    {},
    {
      aggregationType: 'RAW',
    },
  )) as FetchResponse;
  return response;
};

const buildParams = (params: unknown): DataElementsFetchParams => {
  if (!Array.isArray(params)) {
    throw new Error(`Expected params object but got ${params}`);
  }

  return {
    dataElementCodes: params,
  };
};

export const buildDataElementsFetch = (params: unknown) => {
  const builtDataElementsFetchParams = buildParams(params);
  return (aggregator: Aggregator, query: FetchReportQuery) =>
    fetchAnalytics(aggregator, query, builtDataElementsFetchParams);
};
