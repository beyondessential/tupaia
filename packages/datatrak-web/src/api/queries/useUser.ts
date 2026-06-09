import { useQuery } from '@tanstack/react-query';

import { ensure } from '@tupaia/tsutils';
import { DatatrakWebUserRequest } from '@tupaia/types';

import { getUser } from '../../database';
import { useDatabaseContext } from '../../hooks/database';
import { DatatrakWebModelRegistry } from '../../types';
import { get } from '../api';
import { useIsOfflineFirst } from '../offlineFirst';

export type GetUserLocalContext = {
  models: DatatrakWebModelRegistry;
};

const getUserOnline = async () => {
  return await get('getUser');
};

export const useUser = () => {
  const isOfflineFirst = useIsOfflineFirst();
  const { models } = useDatabaseContext() || {};

  // A special case where we want don't want to use useDatabaseQuery to avoid circular context
  return useQuery<DatatrakWebUserRequest.ResBody>(
    ['getUser'],
    isOfflineFirst
      ? async () =>
          await getUser({
            models: ensure(models, 'getUser query function called with undefined models'),
          })
      : getUserOnline,
    {
      staleTime: 0,
      cacheTime: 0,
      refetchOnMount: 'always',
    },
  );
};
