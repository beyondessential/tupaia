/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import { useQuery } from 'react-query';
import { get } from '../api';

export const useUsers = options =>
  useQuery('users', () => get('users'), {
    retry: 0,
    keepPreviousData: true,
    staleTime: 1000 * 60 * 60 * 1,
    refetchOnWindowFocus: false,
    ...options,
  });
