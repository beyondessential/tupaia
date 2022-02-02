/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import { stringifyQuery } from '@tupaia/utils';
import { useQuery } from 'react-query';
import { get } from '../api';
import { DEFAULT_REACT_QUERY_OPTIONS } from '../constants';

export const useSearchDataSources = ({ search, type = 'dataElement', maxResults = 100 }) =>
  useQuery(
    ['dataSources', type, search],
    async () => {
      const endpoint = stringifyQuery(undefined, 'dataSources', {
        columns: JSON.stringify(['code', 'type']),
        filter: JSON.stringify({
          type,
          code: { comparator: 'ilike', comparisonValue: `${search}%`, castAs: 'text' },
        }),
        pageSize: maxResults,
      });
      return get(endpoint);
    },
    {
      ...DEFAULT_REACT_QUERY_OPTIONS,
      keepPreviousData: true,
    },
  );

export const useSearchAggregationOptions = ({ search }) =>
  useQuery(
    ['aggregationOptions', search],
    async () => {
      const endpoint = stringifyQuery(undefined, 'fetchAggregationOptions', {});
      return get(endpoint);
    },
    {
      ...DEFAULT_REACT_QUERY_OPTIONS,
      keepPreviousData: true,
    },
  );
