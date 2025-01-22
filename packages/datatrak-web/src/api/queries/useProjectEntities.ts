import { UseQueryOptions, useQuery } from '@tanstack/react-query';
import { DatatrakWebEntityDescendantsRequest } from '@tupaia/types';
import { get } from '../api';

export type UseProjectEntitiesQueryOptions = UseQueryOptions<
  DatatrakWebEntityDescendantsRequest.ResBody,
  Error
>;

export const useProjectEntities = (
  projectCode?: string,
  params?: DatatrakWebEntityDescendantsRequest.ReqBody,
  useQueryOptions?: UseProjectEntitiesQueryOptions,
) => {
  return useQuery<DatatrakWebEntityDescendantsRequest.ResBody, Error>(
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
