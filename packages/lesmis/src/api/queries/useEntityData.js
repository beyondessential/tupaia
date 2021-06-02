/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import { useQuery } from 'react-query';
import { useHistory } from 'react-router-dom';
import { get } from '../api';

const useValidatedQuery = query => {
  const history = useHistory();
  if (query.isError && query.error.code === 403) {
    history.push('/not-found');
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
