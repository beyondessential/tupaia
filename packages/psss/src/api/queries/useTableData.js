/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { useQuery } from 'react-query';
import { get } from '../api';

export const useTableData = (endpoint, options) => {
  const query = useQuery([endpoint, options], () => get(endpoint, { ...options }), {
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const data = query?.data?.data?.results ?? [];

  return { ...query, data };
};
