/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import { useQuery } from 'react-query';
import { useHistory } from 'react-router-dom';
import { get } from '../api';
import { useUser } from './useUser';

const useValidatedQuery = query => {
  const history = useHistory();
  const { isLoggedIn } = useUser();

  if (query.isError && query.error.code === 403) {
    if (isLoggedIn) {
      history.push('/not-found');
    } else {
      history.push('/login', { referer: history.location });
    }
  }
  return query;
};

export const useEntityData = entityCode => {
  return useValidatedQuery(
    useQuery(['entity', entityCode], () => get(`entity/${entityCode}`), {
      staleTime: 1000 * 60 * 60 * 1,
      refetchOnWindowFocus: false,
      retry: 2,
    }),
  );
};
