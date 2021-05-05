/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import { useQuery } from 'react-query';
import { get } from '../api';

export const useEntityData = entityCode => {
  return useQuery(
    ['entity', entityCode],
    () => {
      return get(`entity/${entityCode}`);
    },
    {
      staleTime: 1000 * 60 * 60 * 1,
      refetchOnWindowFocus: false,
    },
  );
};
