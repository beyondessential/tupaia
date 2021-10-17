/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { FetchReportQuery, ReportConfig } from '../../types';
import { Aggregator } from '../../aggregator';
import { FetchResponse } from './types';
import { fetchBuilders } from './functions';

type FetchConfig = ReportConfig['fetch'];

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

const buildParams = (params: FetchConfig): FetchParams => {
  const fetchFunction = 'dataGroups' in params ? 'dataGroups' : 'dataElements';

  return {
    call: fetchBuilders[fetchFunction](params),
  };
};

export const buildFetch = (params: FetchConfig) => {
  const builtParams = buildParams(params);
  return (aggregator: Aggregator, query: FetchReportQuery) => fetch(aggregator, query, builtParams);
};
