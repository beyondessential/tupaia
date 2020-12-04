/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { useState } from 'react';
import { usePaginatedQuery } from 'react-query';
import { get } from '../api';

export const useTableData = (endpoint, options) => {
  const [sorting, setSorting] = useState({ order: 'asc', orderBy: undefined });
  const query = usePaginatedQuery(
    [endpoint, options, sorting],
    () => get(endpoint, { ...options, ...sorting }),
    { staleTime: 60 * 1000, refetchOnWindowFocus: false },
  );

  const handleChangeOrderBy = columnKey => {
    const { order, orderBy } = sorting;
    const isDesc = orderBy === columnKey && order === 'desc';
    const newSorting = { order: isDesc ? 'asc' : 'desc', orderBy: columnKey };
    setSorting(newSorting);
  };

  const data = query?.resolvedData?.data?.results ? query.resolvedData.data.results : [];

  return { ...query, ...sorting, handleChangeOrderBy, data };
};
