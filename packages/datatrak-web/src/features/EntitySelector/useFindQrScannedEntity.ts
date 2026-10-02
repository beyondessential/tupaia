import { useCallback } from 'react';

import { DatatrakWebEntityDescendantsRequest, Project } from '@tupaia/types';
import { get, useCurrentUserContext } from '../../api';
import { useIsOfflineFirst } from '../../api/offlineFirst';
import { getEntityDescendants, resolveScannedEntityId } from '../../database';
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
        const { models } = databaseContext;
        results = await getEntityDescendants({
          models,
          projectCode,
          params: { fields: FIELDS, filter, pageSize: 1 },
          user,
          accessPolicy: accessPolicy!,
        });

        // The scanned id belongs to whichever project copy was printed on the QR
        // code, which may not be this project's copy. Resolve it to the local copy
        // via the synced `duplicate_ids` (scanned id → code → local project copy)
        // and retry locally — keeping the scan fully offline.
        if (!results?.length) {
          const localId = await resolveScannedEntityId(models, entityId, projectCode);
          if (localId) {
            results = await getEntityDescendants({
              models,
              projectCode,
              params: { fields: FIELDS, filter: { ...filters, id: localId }, pageSize: 1 },
              user,
              accessPolicy: accessPolicy!,
            });
          }
        }

        // Belt-and-braces: if the id is still unresolved locally (e.g. the entity
        // was never synced to this device), fall back to the server. Requires
        // connectivity; if offline, keep the empty local result.
        if (!results?.length) {
          try {
            results = await get('entityDescendants', {
              params: { fields: FIELDS, filter: { ...filter, projectCode }, pageSize: 1 },
            });
          } catch {
            // Genuinely offline: surface "no matching entity found" as before.
          }
        }
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
