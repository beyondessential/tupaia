/*
 * Tupaia
 *  Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */
import { stringifyQuery } from '@tupaia/utils';
import { useQuery, QueryClient } from 'react-query';
import { get } from '../api';
import { DEFAULT_REACT_QUERY_OPTIONS } from '../constants';

const QUERY_KEY = ['aggregationOptions'];

const queryClient = new QueryClient();

const getAggregationOptions = async () => {
  const endpoint = stringifyQuery(undefined, 'fetchAggregationOptions', {});
  return get(endpoint);
};

export const prefetchAggregationOptions = async () => {
  await queryClient.prefetchQuery(QUERY_KEY, getAggregationOptions);
};

export const useSearchAggregationOptions = () =>
  useQuery(QUERY_KEY, getAggregationOptions, {
    ...DEFAULT_REACT_QUERY_OPTIONS,
    keepPreviousData: true,
  });
