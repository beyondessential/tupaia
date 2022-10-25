/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import { useQuery } from 'react-query';
import { get } from '../api';

export const useEntities = (hierarchy, type) => {
  return useQuery(
    ['entities', hierarchy, type],
    () =>
      get(`entities/${hierarchy}`, {
        params: {
          type,
        },
      }),
    {
      staleTime: 1000 * 60 * 60 * 1,
      refetchOnWindowFocus: false,
      retry: 2,
      enabled: hierarchy !== null,
    },
  );
};
