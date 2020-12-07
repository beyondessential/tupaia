/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { useQuery } from 'react-query';
import { get } from '../api';

/**
 *
 * @param endpoint - api endpoint
 * @param apiOptions - axios options
 * @param queryOptions - react-query options
 * @returns {}
 */
export const useData = (endpoint, apiOptions, queryOptions) => {
  const query = useQuery([endpoint, apiOptions.params], () => get(endpoint, { ...apiOptions }), {
    staleTime: 60 * 1000 * 5,
    refetchOnWindowFocus: false,
    ...queryOptions,
  });
  const data = query?.data?.data?.results ?? [];

  return { ...query, data };
};
