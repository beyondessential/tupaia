import { UseQueryOptions, useQuery } from '@tanstack/react-query';
import { DatatrakWebEntitiesRequest, Entity } from '@tupaia/types';
import { get } from '../api';

export const useEntityByCode = (
  entityCode: Entity['code'] | undefined,
  useQueryOptions?: UseQueryOptions<DatatrakWebEntitiesRequest.ResBody[0]>,
) => {
  return useQuery<DatatrakWebEntitiesRequest.ResBody[0]>(
    ['entity', entityCode],
    () => get(`entity/${entityCode}`),
    {
      enabled: !!entityCode && (useQueryOptions?.enabled ?? true),
      ...useQueryOptions,
    },
  );
};

export const useEntityById = (
  entityId: Entity['id'] | undefined,
  useQueryOptions?: UseQueryOptions<DatatrakWebEntitiesRequest.ResBody[0]>,
) => {
  return useQuery<DatatrakWebEntitiesRequest.ResBody[0]>(
    ['entities', entityId],
    async () => {
      const response = await get('entities', {
        params: { filter: { id: entityId } },
      });
      return response[0];
    },
    {
      enabled: !!entityId && (useQueryOptions?.enabled ?? true),
      ...useQueryOptions,
    },
  );
};
