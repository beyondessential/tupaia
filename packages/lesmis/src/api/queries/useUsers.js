/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import { useQuery } from 'react-query';
import { get } from '../api';

export const useUsers = options => {
  const query = useQuery('users', () => get('users'), {
    retry: 0,
    // should be refetched in the background every hour
    staleTime: 1000 * 60 * 60 * 1,
    refetchOnWindowFocus: false,
    ...options,
  });

  if (query.data) {
    console.log('query data', query.data);
  }

  return query;
};
