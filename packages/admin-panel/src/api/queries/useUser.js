import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { get } from '../../VizBuilderApp/api';

export const useUser = () => {
  const query = useQuery(['user'], () => get('user'), {
    retry: false,
    staleTime: 1000 * 60 * 60 * 1,
  });

  return useMemo(() => {
    const isLoggedIn = query.isSuccess && Boolean(query.data?.id);
    return {
      ...query,
      isLoggedIn,
    };
  }, [query]);
};
