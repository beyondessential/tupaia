/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { FetchReportQuery } from '../../types';
import { ReportServerAggregator } from '../../aggregator';
import { FetchResponse } from './types';
import { fetchBuilders } from './functions';
import { Report } from '@tupaia/types';

type FetchConfig = Report['config']['fetch'];

type FetchParams = {
  call: (aggregator: ReportServerAggregator, query: FetchReportQuery) => Promise<FetchResponse>;
};

const fetch = (
  aggregator: ReportServerAggregator,
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
  return (aggregator: ReportServerAggregator, query: FetchReportQuery) =>
    fetch(aggregator, query, builtParams);
};
