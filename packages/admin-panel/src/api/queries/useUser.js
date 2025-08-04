import { useQuery } from '@tanstack/react-query';
import { get } from '../../VizBuilderApp/api';

export const useUser = () => {
  const query = useQuery(['user'], () => get('user'), {
    retry: false,
    staleTime: 1000 * 60 * 60 * 1,
  });

  const isLoggedIn = query.isSuccess && Boolean(query.data?.id);

  return {
    ...query,
    isLoggedIn,
  };
};
