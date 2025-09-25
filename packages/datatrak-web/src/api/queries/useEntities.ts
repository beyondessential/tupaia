import { useQuery } from '@tanstack/react-query';
import { DatatrakWebEntitiesRequest } from '@tupaia/types';
import { get } from '../api';

export const useEntities = params => {
  return useQuery<DatatrakWebEntitiesRequest.ResBody>(
    ['entities', params],
    async () => await get('entities', { params }),
  );
};
