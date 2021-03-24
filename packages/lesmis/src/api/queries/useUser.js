/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import { useQuery } from 'react-query';
import { get } from '../api';

export const useUser = () => {
  const query = useQuery('user', () => get('user'), {
    retry: 0,
    // should be refetched in the background every hour
    staleTime: 1000 * 60 * 60 * 1,
    refetchOnWindowFocus: false,
  });

  const user = query.data;
  const isLoggedIn = query.isSuccess && user !== undefined;

  return { ...query, isLoggedIn };
};
