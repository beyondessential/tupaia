/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { FetchReportQuery } from '../../types';
import { Aggregator } from '../../aggregator';
import { FetchResponse } from './types';
import { fetchBuilders } from './functions';

const FETCH_PARAM_KEYS = ['dataGroups', 'dataElements', 'aggregations'];

type FetchParams = {
  call: (aggregator: Aggregator, query: FetchReportQuery) => Promise<FetchResponse>;
};

const fetch = (
  aggregator: Aggregator,
  query: FetchReportQuery,
  fetcher: FetchParams,
): Promise<FetchResponse> => {
  return fetcher.call(aggregator, query);
};

const buildParams = (params: unknown): FetchParams => {
  if (typeof params !== 'object' || params === null) {
    throw new Error(`Expected object but got ${params}`);
  }

  Object.keys(params).forEach(p => {
    if (!FETCH_PARAM_KEYS.includes(p)) {
      throw new Error(`Invalid fetch param key ${p}, must be one of ${FETCH_PARAM_KEYS}`);
    }
  });

  const fetchFunction = 'dataGroups' in params ? 'dataGroups' : 'dataElements';

  if (!(fetchFunction in fetchBuilders)) {
    throw new Error(
      `Expected fetch to be one of ${Object.keys(fetchBuilders)} but got ${fetchFunction}`,
    );
  }

  return {
    call: fetchBuilders[fetchFunction as keyof typeof fetchBuilders](params),
  };
};

export const buildFetch = (params: unknown) => {
  const builtParams = buildParams(params);
  return (aggregator: Aggregator, query: FetchReportQuery) => fetch(aggregator, query, builtParams);
};
