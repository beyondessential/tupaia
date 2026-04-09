import type { DatatrakWebEntitiesRequest } from '@tupaia/types';
import { useOnlineQuery } from './useOnlineQuery';
import { get } from '../api';

export const useEntities = params => {
  return useOnlineQuery<DatatrakWebEntitiesRequest.ResBody>(
    ['entities', params],
    async () => await get('entities', { params }),
  );
};
