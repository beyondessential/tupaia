/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { usePaginatedQuery } from 'react-query';
import { get } from '../api';

export const useTableData = (endpoint, apiOptions, queryOptions) => {
  const query = usePaginatedQuery(
    [endpoint, apiOptions.params], // key
    () => get(endpoint, { ...apiOptions }), // api call
    { staleTime: 60 * 1000 * 5, refetchOnWindowFocus: false, ...queryOptions }, // options
  );
  const data = query?.resolvedData?.data?.results ? query.resolvedData.data.results : [];

  return { ...query, data };
};
