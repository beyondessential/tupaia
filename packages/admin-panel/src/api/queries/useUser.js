import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { get } from '../../VizBuilderApp/api';

export const useUser = () => {
  const query = useQuery(['user'], () => get('user'), {
    retry: false,
    staleTime: 3_600_000, // 1 hour
  });

  return useMemo(
    () => ({
      ...query,
      isLoggedIn: query.isSuccess && Boolean(query.data?.id),
    }),
    [query],
  );
};
