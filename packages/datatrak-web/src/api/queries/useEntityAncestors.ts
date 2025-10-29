import { Project } from '@tupaia/types';

import { DatatrakWebModelRegistry, Entity } from '../../types';
import { get } from '../api';
import { useDatabaseQuery } from './useDatabaseQuery';
import { useIsOfflineFirst } from '../offlineFirst';
import { getEntityAncestors } from '../../database/entity';

export interface UseEntityAncestorsLocalContext {
  models: DatatrakWebModelRegistry;
  projectCode?: Project['code'];
  entityCode?: Entity['code'];
}

const getEntityAncestorsOnline = async ({
  projectCode,
  entityCode,
}: UseEntityAncestorsLocalContext) => {
  return await get(`entityAncestors/${projectCode}/${entityCode}`);
};

export const useEntityAncestors = (projectCode?: Project['code'], entityCode?: Entity['code']) => {
  const isOfflineFirst = useIsOfflineFirst();

  return useDatabaseQuery(
    ['entityAncestors', projectCode, entityCode],
    isOfflineFirst ? getEntityAncestors : getEntityAncestorsOnline,
    {
      localContext: { projectCode, entityCode },
      enabled: !!projectCode && !!entityCode,
    },
  );
};
