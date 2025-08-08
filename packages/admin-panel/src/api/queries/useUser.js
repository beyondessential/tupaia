import { useQuery } from '@tanstack/react-query';
import { get } from '../../VizBuilderApp/api';
import { getHasVizBuilderAccess } from '../../utilities';

export const useUser = () => {
  const query = useQuery(['user'], () => get('user'), {
    retry: false,
    staleTime: 1000 * 60 * 60 * 1,
  });

  const isLoggedIn = !query.isError && !!query.data && !!query.data.id;

  const hasVizBuilderAccess = getHasVizBuilderAccess(query?.data);

  return {
    ...query,
    isLoggedIn,
    hasVizBuilderAccess,
  };
};
