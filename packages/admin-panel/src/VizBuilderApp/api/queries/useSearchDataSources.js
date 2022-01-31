/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import { useQuery } from 'react-query';
import { get } from '../api';
import { DEFAULT_REACT_QUERY_OPTIONS } from '../constants';
import { stringifyQuery } from '@tupaia/utils';

export const useSearchDataSources = ({
  getQueryFn,
  search,
  type = 'dataElement',
  maxResults = 100,
}) =>
  useQuery(['dataSources', type, search], getQueryFn({ type, search, maxResults }), {
    ...DEFAULT_REACT_QUERY_OPTIONS,
    keepPreviousData: true,
  });

export const getQueryFnFromDatabase = ({ type, search, maxResults }) => async () => {
  const endpoint = stringifyQuery(undefined, 'dataSources', {
    columns: JSON.stringify(['code', 'type']),
    filter: JSON.stringify({
      type,
      code: { comparator: 'ilike', comparisonValue: `${search}%`, castAs: 'text' },
    }),
    pageSize: maxResults,
  });
  return get(endpoint);
};

export const getQueryFnFromReportServer = ({ search }) => async () => {
  const endpoint = stringifyQuery(undefined, 'fetchAggregationOptions', {});
  const result = await get(endpoint);
  return result.filter(({ code }) => code.toLowerCase().includes(search.toLowerCase()));
};
