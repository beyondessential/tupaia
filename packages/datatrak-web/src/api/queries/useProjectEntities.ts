import { UseQueryOptions, useQuery } from '@tanstack/react-query';

import { DatatrakWebEntityDescendantsRequest, Project } from '@tupaia/types';

import { get } from '../api';

export interface UseProjectEntitiesQueryOptions
  extends UseQueryOptions<DatatrakWebEntityDescendantsRequest.ResBody> {}

export const useProjectEntities = (
  projectCode?: Project['code'],
  params?: DatatrakWebEntityDescendantsRequest.ReqBody,
  useQueryOptions?: UseProjectEntitiesQueryOptions,
) => {
  return useQuery<DatatrakWebEntityDescendantsRequest.ResBody>(
    ['entityDescendants', projectCode, params],
    () => {
      return get('entityDescendants', {
        params: { ...params, filter: { ...params?.filter, projectCode } },
      });
    },
    {
      ...useQueryOptions,
      enabled: !!projectCode && useQueryOptions?.enabled,
      placeholderData: [] as DatatrakWebEntityDescendantsRequest.ResBody,
    },
  );
};
