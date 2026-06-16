import { get } from 'es-toolkit/compat';
import { compare } from 'compare-versions';
import { getHighestPossibleIdForGivenTime, SqlQuery } from '@tupaia/database';
import { ValidationError } from '@tupaia/utils';
import { fetchRequestingMeditrakDevice } from '../utilities';

const isAppVersionGreaterThanMin = (version, minVersion) => compare(version, minVersion, '>=');

const getSupportedTypes = async (models, appVersion) => {
  const minAppVersionByType = models.getMinAppVersionByType();
  return Object.keys(minAppVersionByType).filter(type =>
    isAppVersionGreaterThanMin(appVersion, minAppVersionByType[type]),
  );
};

export const recordTypeFilter = async req => {
  const { models } = req;
  const { appVersion, recordTypes = null } = req.query;

  if (recordTypes) {
    const recordTypesArray = recordTypes.split(',');
    return {
      query: `record_type IN ${SqlQuery.record(recordTypesArray)}`,
      params: recordTypesArray,
    };
  }
  if (appVersion) {
    const supportedTypes = await getSupportedTypes(models, appVersion);
    return {
      query: `record_type IN ${SqlQuery.record(supportedTypes)}`,
      params: supportedTypes,
    };
  }

  const meditrakDevice = await fetchRequestingMeditrakDevice(req);
  const unsupportedTypes = get(meditrakDevice, 'config.unsupportedTypes', []);
  if (unsupportedTypes.length > 0) {
    return {
      query: `record_type NOT IN ${SqlQuery.record(unsupportedTypes)}`,
      params: unsupportedTypes,
    };
  }

  return null;
};

// Based on the 'since' query parameter, work out what the highest possible record id is that
// the client could have already synchronised, and ignore any 'delete' type sync actions for
// records with higher ids: if the client doesn't know about them there is no point in telling
// them to delete them
export const deletesSinceLastSync = since => {
  let query = '';
  const params = [];

  const highestPossibleSyncedId = getHighestPossibleIdForGivenTime(since);
  // Only sync deletes that have occurred prior to the latest possibly synced record
  query = query.concat(`
    change_time > ? AND "type" = ? AND record_id <= ?
  `);
  params.push(since, 'delete', highestPossibleSyncedId);

  return { query, params };
};

// LEFT JOIN the set of canonical entity ids (MIN(id) per code) so the canonical
// filter below can test membership with a hash join instead of a per-row
// IN-subquery. On a ~1M-row sync queue the IN-subquery form was planned as a
// non-hashed Materialized subplan probed per row (cost ~1.4 billion → sync
// timed out); the hash join is ~12,000x cheaper. The subquery yields one row
// per code, so the LEFT JOIN never multiplies sync-queue rows.
export const selectFromClause = select => `
  SELECT ${select} FROM permissions_based_meditrak_sync_queue
  LEFT JOIN (
    SELECT MIN(id) AS canonical_entity_id FROM entity GROUP BY code
  ) canonical_entities ON canonical_entities.canonical_entity_id = record_id
`;

/**
 * Post-epic, `entity` can have multiple rows per code (one per project).
 * MediTrak models entities as canonical (one row per code), so this filter
 * limits entity-row changes to the canonical row only:
 *
 *   canonical = MIN(id) GROUP BY code
 *
 * Non-entity records pass through unchanged. Membership is resolved via the
 * `canonical_entities` LEFT JOIN added in `selectFromClause` (an entity record
 * is canonical iff it matched that join) rather than an inline IN-subquery,
 * which the planner couldn't hash and ran per-row. See TUP-3067 for the
 * rationale — pre-epic rows kept their original id through the migration, and
 * any newer duplicate inserts get fresh timestamp-prefixed ids (always higher),
 * so MIN(id) deterministically picks the pre-epic original row.
 *
 * Delete tombstones are always passed through: a deleted row is gone from `entity`
 * so it can never match the canonical join, but MediTrak still needs to be told to
 * remove a fully-deleted entity. The enqueuer (MeditrakSyncRecordUpdater) only writes
 * an entity delete to the queue when no rows remain for that code (a true full
 * deletion), never for a duplicate-only deletion — so passing all entity deletes here
 * is safe.
 */
export const canonicalEntityFilter = () => ({
  query: `(
      record_type != 'entity'
      OR canonical_entities.canonical_entity_id IS NOT NULL
      OR "type" = 'delete'
    )`,
  params: [],
});

export const extractSinceValue = req => {
  const { since = 0 } = req.query;
  if (isNaN(since)) {
    throw new ValidationError("The 'since' parameter must be a number.");
  }

  return parseFloat(since);
};

export const getModifiers = (sort, limit, offset) => {
  let query = '';
  const params = [];

  if (sort) {
    query = query.concat(`
    ORDER BY ${sort}
    `);
  }

  if (limit !== undefined) {
    query = query.concat(`
    LIMIT ?
    `);
    params.push(limit);
  }

  if (offset !== undefined) {
    query = query.concat(`
    OFFSET ?
    `);
    params.push(offset);
  }

  return { query, params };
};

export const buildMeditrakSyncQuery = async (req, { select, sort, limit, offset }) => {
  const since = extractSinceValue(req);

  const query = new SqlQuery();
  query.append(selectFromClause(select));
  query.append(`WHERE
  (`);
  query.append({ query: '(change_time > ? AND "type" = ?)', params: [since, 'update'] });
  query.append(`
  OR (`);
  query.append(deletesSinceLastSync(since));
  query.append(`
  ))`);
  const filter = await recordTypeFilter(req);
  if (filter) {
    query.append(`
      AND `);
    query.append(filter);
  }

  query.append(`
      AND `);
  query.append(canonicalEntityFilter());

  query.append(getModifiers(sort, limit, offset));

  return { query };
};
