import { QueryConjunctions } from '@tupaia/tsmodels';
import type { Entity, Project } from '@tupaia/types';
import type { DatatrakWebModelRegistry } from '../../types';

/**
 * Per-project entity duplication gives each project's copy of an entity a new id
 * while every copy keeps the same `code`. A printed QR code carries one copy's id,
 * which may belong to a project this device didn't sync — so a direct id lookup
 * fails. Each synced entity ships its siblings' ids in `duplicate_ids`, so we can
 * find the local entity that lists the scanned id, then resolve its `code` to this
 * project's copy.
 *
 * Returns the local project copy's id, or `undefined` if the scanned id isn't known
 * locally (caller then falls back to the server).
 */
export const resolveScannedEntityId = async (
  models: DatatrakWebModelRegistry,
  scannedId: Entity['id'],
  projectCode: Project['code'],
): Promise<Entity['id'] | undefined> => {
  const sibling = await models.entity.findOne({
    [QueryConjunctions.RAW]: {
      sql: 'duplicate_ids @> ARRAY[?]',
      parameters: [scannedId],
    },
  });
  if (!sibling) return undefined;

  const project = await models.project.findOne({ code: projectCode });
  const localCopy = await models.entity.findOneByCodeInProject(sibling.code, project?.id ?? null);
  return localCopy?.id;
};
