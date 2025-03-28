import { UseQueryOptions, useQuery } from '@tanstack/react-query';
import { DatatrakWebEntitiesRequest } from '@tupaia/types';
import { get } from '../api';
import { Entity } from '@tupaia/types';

export const useEntityByCode = (
  entityCode: Entity['code'],
  options?: UseQueryOptions<DatatrakWebEntitiesRequest.ResBody>,
) => {
  return useQuery<DatatrakWebEntitiesRequest.ResBody>(
    ['entity', entityCode],
    () => get(`entity/${entityCode}`),
    options,
  );
};

export const useEntityById = (
  entityId: Entity['id'],
  options?: UseQueryOptions<DatatrakWebEntitiesRequest.ResBody>,
) => {
  return useQuery<DatatrakWebEntitiesRequest.ResBody[0]>(
    ['entities', entityId],
    async () => {
      const response = await get('entities', {
        params: { filter: { id: entityId } },
      });
      return response[0];
    },
    options,
  );
};
