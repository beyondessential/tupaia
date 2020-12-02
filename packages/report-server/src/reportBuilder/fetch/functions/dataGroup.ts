/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { Aggregator } from '../../../aggregator';
import { FetchReportQuery } from '../../../types';
import { FetchResponse } from '../types';

type DataGroupFetchParams = {
  dataGroupCode: string;
};

const fetchEvents = async (
  aggregator: Aggregator,
  query: FetchReportQuery,
  params: DataGroupFetchParams,
): Promise<FetchResponse> => {
  const { dataGroupCode } = params;
  const { organisationUnitCodes, period } = query;
  const response = await aggregator.fetchEvents(dataGroupCode, organisationUnitCodes, period);
  const rows = response.map(event => {
    const { dataValues, ...restOfEvent } = event;
    return { ...dataValues, ...restOfEvent };
  });
  return {
    results: rows,
  };
};

const buildParams = (params: unknown): DataGroupFetchParams => {
  if (!Array.isArray(params)) {
    throw new Error(`Expected an array with a single data group code but got ${params}`);
  }

  if (params.length > 1) {
    throw new Error(`Expected just a single data group code`);
  }

  const dataGroupCode = params[0];

  if (typeof dataGroupCode !== 'string') {
    throw new Error(`Expected the data group code to be a string, but got ${dataGroupCode}`);
  }

  return {
    dataGroupCode,
  };
};

export const buildDataGroupFetch = (params: unknown) => {
  const builtDataGroupsFetchParams = buildParams(params);
  return (aggregator: Aggregator, query: FetchReportQuery) =>
    fetchEvents(aggregator, query, builtDataGroupsFetchParams);
};
