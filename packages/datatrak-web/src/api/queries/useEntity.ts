import { UseQueryOptions, useQuery } from '@tanstack/react-query';
import { DatatrakWebEntitiesRequest, Entity } from '@tupaia/types';
import { get } from '../api';

export const useEntityByCode = (
  entityCode?: Entity['code'],
  useQueryOptions?: UseQueryOptions<DatatrakWebEntitiesRequest.EntitiesResponseItem>,
) => {
  return useQuery<DatatrakWebEntitiesRequest.EntitiesResponseItem>(
    ['entity', entityCode],
    async () => await get(`entity/${entityCode}`),
    {
      ...useQueryOptions,
      enabled: !!entityCode && (useQueryOptions?.enabled ?? true),
    },
  );
};

export const useEntityById = (
  entityId?: Entity['id'],
  useQueryOptions?: UseQueryOptions<DatatrakWebEntitiesRequest.EntitiesResponseItem>,
) => {
  return useQuery<DatatrakWebEntitiesRequest.EntitiesResponseItem>(
    ['entities', entityId],
    async () => {
      const [entity] = await get('entities', {
        params: {
          filter: { id: entityId },
        },
      });
      return entity;
    },
    {
      ...useQueryOptions,
      enabled: !!entityId && (useQueryOptions?.enabled ?? true),
    },
  );
};
