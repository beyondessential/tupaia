/*
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { useQuery } from '@tanstack/react-query';
import { get } from '../../api';

const COMMON_QUERY_OPTIONS = {
  staleTime: 60 * 1000 * 5,
  refetchOnWindowFocus: false,
};

/**
 * @param apiOptions axios options
 * @param queryOptions react-query options
 */
export const useData = (endpoint, apiOptions = {}, queryOptions = {}) => {
  const query = useQuery([endpoint, apiOptions.params], () => get(endpoint, apiOptions), {
    ...COMMON_QUERY_OPTIONS,
    ...queryOptions,
  });
  const data = query?.data?.data;

  return { ...query, data };
};

/**
 * @param apiOptions axios options
 * @param queryOptions react-query options
 */
export const useReport = (endpoint, apiOptions = {}, queryOptions = {}) => {
  const query = useQuery([endpoint, apiOptions.params], () => get(endpoint, apiOptions), {
    ...COMMON_QUERY_OPTIONS,
    ...queryOptions,
  });
  const data = query?.data?.data?.results ?? [];

  return { ...query, data };
};

/**
 * @param apiOptions axios options
 * @param queryOptions react-query options
 */
export const usePaginatedReport = (endpoint, apiOptions = {}, queryOptions = {}) => {
  const query = useQuery([endpoint, apiOptions.params], () => get(endpoint, apiOptions), {
    ...COMMON_QUERY_OPTIONS,
    ...queryOptions,
    keepPreviousData: true,
  });
  const data = query?.data?.data?.results ?? [];

  return { ...query, data };
};

/**
 * @param {Record<string, any>} queryObject
 */
export const combineQueries = queryObject => {
  const queries = Object.values(queryObject);

  return {
    isLoading: !!queries.find(q => q.isLoading),
    isFetching: !!queries.find(q => q.isFetching),
    error: queries.find(q => q.error)?.error ?? null,
    data: Object.fromEntries(Object.entries(queryObject).map(([key, q]) => [key, q.data])),
  };
};
