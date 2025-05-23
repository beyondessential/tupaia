import { useQuery } from '@tanstack/react-query';
import { DatatrakWebEntitiesRequest } from '@tupaia/types';
import { get } from '../api';

export const useEntities = params => {
  return useQuery(
    ['entities', params],
    (): Promise<DatatrakWebEntitiesRequest.ResBody> => get(`entities`, { params }),
  );
};
