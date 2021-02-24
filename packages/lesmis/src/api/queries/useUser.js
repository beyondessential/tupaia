/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import { useQuery } from 'react-query';
import { get } from '../api';

export const useUser = () => {
  const query = useQuery('getUser', () => get('getUser'), {
    retry: 0,
    // should be refetched in the background every hour
    staleTime: 1000 * 60 * 60 * 1,
  });

  const user = query.data;
  const isLoggedIn = query.isSuccess && user !== undefined && user.name && user.name !== 'public';

  return { ...query, isLoggedIn };
};
