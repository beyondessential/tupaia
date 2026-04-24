import { useCallback } from 'react';

import { DatatrakWebEntityDescendantsRequest, Project } from '@tupaia/types';
import { get, useCurrentUserContext } from '../../api';
import { useIsOfflineFirst } from '../../api/offlineFirst';
import { getEntityDescendants } from '../../database';
import { useDatabaseContext } from '../../hooks/database';
import type { ExtendedEntityFieldName } from '../../utils';

const FIELDS: ExtendedEntityFieldName[] = ['id', 'name'];

/**
 * Returns an async function that validates whether an entity (by ID) is a valid
 * descendant matching the given filters. Used by the QR code scanner so we only
 * fetch one entity on scan rather than pre-loading every valid entity.
 */
export const useFindQrScannedEntity = (
  projectCode: Project['code'] | undefined,
  filters: Record<string, string | string[]>,
) => {
  const isOfflineFirst = useIsOfflineFirst();
  const databaseContext = useDatabaseContext();
  const currentUserContext = useCurrentUserContext();

  return useCallback(
    async (
      entityId: string,
    ): Promise<DatatrakWebEntityDescendantsRequest.EntityResponse | undefined> => {
      if (!projectCode) return undefined;

      const { accessPolicy, ...user } = currentUserContext;
      const filter = { ...filters, id: entityId };

      let results: DatatrakWebEntityDescendantsRequest.ResBody;
      if (isOfflineFirst && databaseContext?.models) {
        results = await getEntityDescendants({
          models: databaseContext.models,
          projectCode,
          params: { fields: FIELDS, filter, pageSize: 1 },
          user,
          accessPolicy: accessPolicy!,
        });
      } else {
        results = await get('entityDescendants', {
          params: { fields: FIELDS, filter: { ...filter, projectCode }, pageSize: 1 },
        });
      }

      return results?.[0];
    },
    [projectCode, filters, isOfflineFirst, databaseContext, currentUserContext],
  );
};
