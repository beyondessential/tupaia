/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { FetchReportQuery } from '../../types';
import { Aggregator } from '../../aggregator';
import { FetchResponse } from './types';
import { fetchBuilders } from './functions';

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

  if (Object.keys(params).length > 1) {
    throw new Error(`Expected fetch params to contain a single key`);
  }

  const fetchFunction = Object.keys(params)[0];

  if (!(fetchFunction in fetchBuilders)) {
    throw new Error(
      `Expected transform to be one of ${Object.keys(fetchBuilders)} but got ${fetchFunction}`,
    );
  }

  return {
    call: fetchBuilders[fetchFunction as keyof typeof fetchBuilders](params[fetchFunction]),
  };
};

export const buildFetch = (params: unknown) => {
  const builtParams = buildParams(params);
  return (aggregator: Aggregator, query: FetchReportQuery) => fetch(aggregator, query, builtParams);
};
