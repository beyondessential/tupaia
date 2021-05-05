/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import { useQuery, useQueryClient } from 'react-query';
import { get } from '../api';

export const useEntityData = entityCode => {
  const queryClient = useQueryClient();
  return useQuery(
    ['entity', entityCode],
    () => {
      return get(`entity/${entityCode}`);
    },
    {
      staleTime: 1000 * 60 * 60 * 1,
      refetchOnWindowFocus: false,
      // pre-populate the query data from the cached entities data if it's available
      initialData: () =>
        queryClient
          .getQueryData('entities')
          ?.find(entity => entity.code === entityCode && !!entity.bounds), // check the entity exists and isn't "lean"/geo-data free
    },
  );
};
