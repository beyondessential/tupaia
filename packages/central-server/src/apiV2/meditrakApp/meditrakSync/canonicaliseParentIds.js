import { RECORDS } from '@tupaia/database';

/**
 * MediTrak sees entities as canonical (one row per code). The canonical row
 * for a code is `MIN(id) GROUP BY code`. When we sync an entity down, its
 * `parent_id` column points at the parent's project-specific row — which
 * MediTrak doesn't know about. Rewrite every entity record's `parent_id` to
 * the canonical parent id so MediTrak's local hierarchy stays consistent.
 *
 * Performs a single batch query to build the
 * project-specific-parent-id → canonical-parent-id map, then mutates each
 * entity record in place.
 *
 * @param {ModelRegistry} models
 * @param {{ recordType: string, record: Record<string, any> }[]} changesToSend
 */
export const canonicaliseEntityParentIds = async (models, changesToSend) => {
  const entityChanges = changesToSend.filter(
    c => c.recordType === RECORDS.ENTITY && c.record?.parent_id,
  );
  if (entityChanges.length === 0) return;

  const parentIds = [...new Set(entityChanges.map(c => c.record.parent_id))];

  // For each project-specific parent id, find the canonical id (MIN(id) of
  // rows sharing the same code). The window function avoids a correlated
  // subquery per row.
  const rows = await models.database.executeSql(
    `
      SELECT id AS orig_id,
             MIN(id) OVER (PARTITION BY code) AS canonical_id
      FROM entity
      WHERE id = ANY(?) OR code IN (SELECT code FROM entity WHERE id = ANY(?));
    `,
    [parentIds, parentIds],
  );

  const canonicalByOrig = new Map();
  rows.forEach(({ orig_id: origId, canonical_id: canonicalId }) => {
    canonicalByOrig.set(origId, canonicalId);
  });

  entityChanges.forEach(change => {
    const mapped = canonicalByOrig.get(change.record.parent_id);
    if (mapped) {
      change.record.parent_id = mapped;
    }
  });
};
