/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { useState } from 'react';
import { useQuery } from 'react-query';
import { FakeAPI as api } from '../api';

export const useTableQuery = (endpoint, options) => {
  const [sorting, setSorting] = useState({ order: 'asc', orderBy: undefined });
  const query = useQuery(
    [endpoint, options, sorting],
    () => api.get(endpoint, { ...options, ...sorting }),
    { staleTime: 50 },
  );

  const handleChangeOrderBy = columnKey => {
    const { order, orderBy } = sorting;
    const isDesc = orderBy === columnKey && order === 'desc';
    const newSorting = { order: isDesc ? 'asc' : 'desc', orderBy: columnKey };
    setSorting(newSorting);
  };

  return { ...query, ...sorting, handleChangeOrderBy };
};
