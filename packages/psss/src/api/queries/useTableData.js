/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { usePaginatedQuery } from 'react-query';
import { get } from '../api';

/**
 *
 * @param endpoint - api endpoint
 * @param apiOptions - axios options
 * @param queryOptions - react-query options
 * @returns {}
 */
export const useTableData = (endpoint, apiOptions, queryOptions) => {
  const query = usePaginatedQuery(
    [endpoint, apiOptions.params],
    () => get(endpoint, { ...apiOptions }),
    { staleTime: 60 * 1000 * 5, refetchOnWindowFocus: false, ...queryOptions },
  );
  const data = query?.resolvedData?.data?.results ?? [];

  return { ...query, data };
};
