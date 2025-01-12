import { useQuery } from '@tanstack/react-query';
import { get } from '../api';

export const useUser = options => {
  const query = useQuery(['user'], () => get('user'), {
    retry: 0,
    // should be refetched in the background every hour
    staleTime: 1000 * 60 * 60 * 1,
    refetchOnWindowFocus: false,
    ...options,
  });

  const user = query.data;
  const isLoggedIn = user && Object.keys(user).length > 0;
  const hasAdminPanelAccess = user && user.hasAdminPanelAccess;
  const userId = user && user.id;

  return { ...query, isLoggedIn, hasAdminPanelAccess, userId };
};
