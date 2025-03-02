import { UseQueryOptions, useQuery } from '@tanstack/react-query';
import { DatatrakWebEntityDescendantsRequest } from '@tupaia/types';
import { get } from '../api';

export interface UseProjectEntitiesQueryOptions
  extends UseQueryOptions<DatatrakWebEntityDescendantsRequest.ResBody> {}

export const useProjectEntities = (
  projectCode?: string,
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
    },
  );
};
