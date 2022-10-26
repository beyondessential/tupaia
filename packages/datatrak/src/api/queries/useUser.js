/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import { useQuery } from 'react-query';
import { get } from '../api';
import camelcaseKeys from 'camelcase-keys';

export const useUser = () => {
  const query = useQuery(['user'], () => get(`user`), {
    staleTime: 1000 * 60 * 60 * 1,
    refetchOnWindowFocus: false,
    retry: 2,
  });

  const data = camelcaseKeys(query.data);

  return { ...query, data };
};
