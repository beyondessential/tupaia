import { useQuery } from '@tanstack/react-query';

import { DatatrakWebUserRequest } from '@tupaia/types';
import { ensure } from '@tupaia/tsutils';

import { get } from '../api';
import { useIsOfflineFirst } from '../offlineFirst';
import { getUser } from '../../database';
import { DatatrakWebModelRegistry } from '../../types';
import { useDatabaseContext } from '../../hooks/database';

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
    isOfflineFirst ? () => getUser({ models: ensure(models) }) : getUserOnline,
    {
      staleTime: 0,
      cacheTime: 0,
      refetchOnMount: 'always',
    }
  );
};
