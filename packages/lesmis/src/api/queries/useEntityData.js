/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import { useQuery, useQueryClient } from 'react-query';
import { get } from '../api';

export const useEntityData = entityCode => {
  const queryClient = useQueryClient();
  return useQuery(['entity', entityCode], () => get(`entity/${entityCode}`), {
    staleTime: 1000 * 60 * 60 * 1,
    refetchOnWindowFocus: false,
    // pre-poluate the query data from the cached entites data if it's available
    initialData: () =>
      queryClient.getQueryData('entities')?.find(entity => entity.code === entityCode),
  });
};
