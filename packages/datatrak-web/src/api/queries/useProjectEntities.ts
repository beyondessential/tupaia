import { UseQueryOptions, UseQueryResult } from '@tanstack/react-query';

import { DatatrakWebEntityDescendantsRequest, Project } from '@tupaia/types';
import { getEntityDescendants } from '../../database';
import { get } from '../api';
import { useIsOfflineFirst } from '../offlineFirst';
import { useDatabaseQuery } from './useDatabaseQuery';

export interface UseProjectEntitiesQueryOptions
  extends UseQueryOptions<DatatrakWebEntityDescendantsRequest.ResBody> {}

export type UseProjectEntitiesQueryResult =
  UseQueryResult<DatatrakWebEntityDescendantsRequest.ResBody>;

export const useProjectEntities = (
  projectCode?: Project['code'],
  params?: DatatrakWebEntityDescendantsRequest.ReqBody,
  useQueryOptions?: UseProjectEntitiesQueryOptions,
): UseProjectEntitiesQueryResult => {
  const isOfflineFirst = useIsOfflineFirst();
  const getOnlineEntityDescendants = async () => {
    const entities: DatatrakWebEntityDescendantsRequest.ResBody = await get('entityDescendants', {
      params: {
        ...params,
        filter: { ...params?.filter, projectCode },
      },
    });
    return entities;
  };

  return useDatabaseQuery<DatatrakWebEntityDescendantsRequest.ResBody>(
    ['entityDescendants', projectCode, params],
    isOfflineFirst ? getEntityDescendants : getOnlineEntityDescendants,
    {
      ...useQueryOptions,
      enabled: !!projectCode && (useQueryOptions?.enabled ?? true),
      localContext: {
        projectCode,
        params,
      },
    },
  );
};
