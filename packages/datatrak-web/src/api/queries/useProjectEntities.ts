import { UseQueryOptions, UseQueryResult, useQuery } from '@tanstack/react-query';

import { DatatrakWebEntityDescendantsRequest, Project } from '@tupaia/types';

import { get } from '../api';

export interface UseProjectEntitiesQueryOptions
  extends UseQueryOptions<DatatrakWebEntityDescendantsRequest.ResBody> {}

export type UseProjectEntitiesQueryResult =
  UseQueryResult<DatatrakWebEntityDescendantsRequest.ResBody>;

export const useProjectEntities = (
  projectCode?: Project['code'],
  params?: DatatrakWebEntityDescendantsRequest.ReqBody,
  useQueryOptions?: UseProjectEntitiesQueryOptions,
): UseProjectEntitiesQueryResult => {
  const getEntityDescendants = async () => {
    const entities: DatatrakWebEntityDescendantsRequest.ResBody = await get('entityDescendants', {
      params: {
        ...params,
        filter: { ...params?.filter, projectCode },
      },
    });
    return entities;
  };

  return useQuery<DatatrakWebEntityDescendantsRequest.ResBody>(
    ['entityDescendants', projectCode, params],
    getEntityDescendants,
    {
      ...useQueryOptions,
      enabled: !!projectCode && useQueryOptions?.enabled,
      placeholderData: [] as DatatrakWebEntityDescendantsRequest.ResBody,
    },
  );
};
