'use strict';

import { generateId } from '../utilities';

var dbm;
var type;
var seed;

/**
 * RN-1853 data migration. Companion to 20260501000000-addProjectIdToEntity-modifies-schema.js.
 *
 * Runs after the schema migration has added the project_id column and the
 * UNIQUE(code, project_id) constraint. Backfills project_id on existing entities,
 * duplicates rows that belong to multiple projects, repoints downstream FKs to the
 * per-project copies, and finally applies the CHECK constraint that locks in the
 * NULL/NOT-NULL invariant by entity type.
 *
 * Filename suffix `-modifies-data.js` is recognised by setupNewDatabase.sh and skipped
 * for fresh test DBs (which have no data to migrate). That has the side effect of
 * keeping the CHECK constraint out of test DBs, which lets dummy-entity fixtures
 * across the monorepo continue to work without per-test workarounds.
 *
 * See llm/specs/RN-1853-refinement.md and RN-1853-implementation.md.
 */

const ORPHAN_PROJECT_CODE = 'explore';

// metadata flags applied during migration so we can identify rows for rollback or audit
const ORPHAN_FLAG = 'orphaned';
const DUPLICATE_FLAG = 'duplicated_for_rn_1853';

const log = (msg, startTime) => {
  const elapsed = startTime ? ` (+${((Date.now() - startTime) / 1000).toFixed(1)}s)` : '';
  // eslint-disable-next-line no-console
  console.log(`[RN-1853 data]${elapsed} ${msg}`);
};

exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

// ----- up helpers -----

// Look up the explore project. Lazy-checked: an empty DB (e.g. test setup) won't have
// it, and that's fine unless we encounter orphan entities or anomaly survey_responses
// that need somewhere to land — those steps fail-fast if the project is missing.
const lookupExploreProject = async (db, t0) => {
  const result = await db.runSql(
    `SELECT id FROM project WHERE code = $1;`,
    [ORPHAN_PROJECT_CODE],
  );
  const exploreProjectId = result.rows[0]?.id ?? null;
  if (exploreProjectId) {
    log(`Explore project found (id=${exploreProjectId})`, t0);
  } else {
    log(`Explore project NOT found — OK on empty DB; orphan/anomaly steps will fail-fast if needed`, t0);
  }
  return exploreProjectId;
};

// Single-project sub-country entities: the entity's hierarchy belongs to exactly one
// project, so we just stamp project_id with that project.
const backfillSingleProjectEntities = async (db, t0) => {
  const result = await db.runSql(`
    UPDATE entity
    SET project_id = sub.project_id
    FROM (
      SELECT entity.id AS entity_id, MIN(p.id) AS project_id
      FROM entity
      JOIN entity_parent_child_relation epcr ON entity.id = epcr.child_id
      JOIN project p ON p.entity_hierarchy_id = epcr.entity_hierarchy_id
      WHERE entity.type NOT IN ('world', 'project', 'country')
      GROUP BY entity.id
      HAVING count(DISTINCT p.id) = 1
    ) sub
    WHERE entity.id = sub.entity_id;
  `);
  log(`Backfilled single-project entities (${result.rowCount ?? '?'} rows)`, t0);
};

// Multi-project sub-country entities: keep the original row (assigned to the lowest-id
// project) and insert N-1 duplicates, one per remaining project. Duplicates carry the
// duplicate flag in metadata so down() can identify and remove them.
//
// Two bulk SQL statements via JS-built VALUES tables — far faster than per-row INSERTs
// over a remote connection.
const duplicateMultiProjectEntities = async (db, t0) => {
  const multiProjectEntities = await db.runSql(`
    SELECT entity.id, array_agg(DISTINCT p.id ORDER BY p.id) AS project_ids
    FROM entity
    JOIN entity_parent_child_relation epcr ON entity.id = epcr.child_id
    JOIN project p ON p.entity_hierarchy_id = epcr.entity_hierarchy_id
    WHERE entity.type NOT IN ('world', 'project', 'country')
    GROUP BY entity.id
    HAVING count(DISTINCT p.id) > 1;
  `);
  log(`Found ${multiProjectEntities.rows.length} multi-project entities`, t0);

  if (multiProjectEntities.rows.length === 0) return;

  // Original row gets its lowest-id project.
  const firstProjectAssignments = multiProjectEntities.rows
    .map(({ id, project_ids }) => `('${id}','${project_ids[0]}')`)
    .join(',');
  await db.runSql(`
    UPDATE entity
    SET project_id = m.project_id
    FROM (VALUES ${firstProjectAssignments}) AS m(entity_id, project_id)
    WHERE entity.id = m.entity_id;
  `);
  log(`Assigned first project to ${multiProjectEntities.rows.length} originals`, t0);

  // (entity_id, project_id, new_id) triples for the N-1 copies per multi-project entity.
  const copyTriples = [];
  for (const { id, project_ids } of multiProjectEntities.rows) {
    for (let i = 1; i < project_ids.length; i++) {
      copyTriples.push({ entity_id: id, project_id: project_ids[i], new_id: generateId() });
    }
  }
  if (copyTriples.length === 0) return;

  const copyValues = copyTriples
    .map(({ entity_id, project_id, new_id }) => `('${entity_id}','${project_id}','${new_id}')`)
    .join(',');
  await db.runSql(`
    INSERT INTO entity (
      id, code, parent_id, name, type, image_url, country_code,
      point, bounds, metadata, attributes, entity_polygon_id, project_id
    )
    SELECT
      m.new_id, e.code, e.parent_id, e.name, e.type, e.image_url, e.country_code,
      e.point, e.bounds,
      jsonb_set(COALESCE(e.metadata, '{}'::jsonb), '{${DUPLICATE_FLAG}}', 'true'::jsonb),
      e.attributes, e.entity_polygon_id, m.project_id
    FROM entity e
    JOIN (VALUES ${copyValues}) AS m(entity_id, project_id, new_id) ON e.id = m.entity_id;
  `);
  log(`Inserted ${copyTriples.length} duplicate rows`, t0);
};

// After duplication, a child's parent_id may still point at the original (lowest-project)
// copy of its parent. For children whose parent is a sub-country entity, repoint
// parent_id at the same-project copy. Children of structural entities (world/project/
// country) keep parent_id pointing at the shared row — no change needed there.
const fixParentIdChains = async (db, t0) => {
  const result = await db.runSql(`
    UPDATE entity child
    SET parent_id = same_project_parent.id
    FROM entity orig_parent, entity same_project_parent
    WHERE child.parent_id = orig_parent.id
      AND same_project_parent.code = orig_parent.code
      AND same_project_parent.project_id = child.project_id
      AND orig_parent.type NOT IN ('world', 'project', 'country')
      AND child.project_id IS NOT NULL
      AND orig_parent.project_id IS DISTINCT FROM child.project_id
      AND same_project_parent.id <> orig_parent.id;
  `);
  log(`Fixed parent_id chains (${result.rowCount ?? '?'} rows)`, t0);
};

// Sub-country entities with no project mapping (e.g. detached subtrees) get assigned
// to the explore project and tagged as orphaned.
const backfillOrphans = async (db, t0, exploreProjectId) => {
  const orphanCount = await db.runSql(`
    SELECT count(*)::int AS n FROM entity
    WHERE type NOT IN ('world', 'project', 'country') AND project_id IS NULL;
  `);
  const orphansToAssign = orphanCount.rows[0]?.n ?? 0;
  if (orphansToAssign === 0) {
    log('No orphan entities to assign', t0);
    return;
  }
  if (!exploreProjectId) {
    throw new Error(
      `RN-1853 migration aborted: ${orphansToAssign} orphan sub-country entities need a home but '${ORPHAN_PROJECT_CODE}' project is missing.`,
    );
  }
  const result = await db.runSql(
    `
      UPDATE entity
      SET project_id = $1,
          metadata = jsonb_set(COALESCE(metadata, '{}'::jsonb), $2, 'true'::jsonb)
      WHERE type NOT IN ('world', 'project', 'country')
        AND project_id IS NULL;
    `,
    [exploreProjectId, `{${ORPHAN_FLAG}}`],
  );
  log(`Assigned ${result.rowCount ?? '?'} orphans to explore project`, t0);
};

// Standard repoint: each survey's project IS in the entity's hierarchy, so the
// per-project copy of the entity exists — point at it.
const repointSurveyResponses = async (db, t0) => {
  const result = await db.runSql(`
    UPDATE survey_response sr
    SET entity_id = target.id
    FROM survey s, entity original, entity target
    WHERE sr.survey_id = s.id
      AND original.id = sr.entity_id
      AND target.code = original.code
      AND target.project_id = s.project_id
      AND original.type NOT IN ('world', 'project', 'country')
      AND target.id <> original.id;
  `);
  log(`Repointed ${result.rowCount ?? '?'} survey_responses`, t0);
};

// Anomaly: survey's project is NOT in the entity's hierarchy. After the standard
// repoint these still point at the original (now in some unrelated project), so
// redirect to the explore-project copy.
//
// We don't tag these with a metadata flag (survey_response.metadata is text not
// jsonb). Identify post-migration by joining survey_response → entity → project where
// entity.project_id = explore but survey.project_id is something else.
const repointAnomalySurveyResponses = async (db, t0, exploreProjectId) => {
  if (!exploreProjectId) {
    log('Skipped (no explore project — no anomalies to redirect)', t0);
    return;
  }
  const result = await db.runSql(
    `
      UPDATE survey_response sr
      SET entity_id = explore_copy.id
      FROM survey s, entity original, entity explore_copy
      WHERE sr.survey_id = s.id
        AND original.id = sr.entity_id
        AND explore_copy.code = original.code
        AND explore_copy.project_id = $1
        AND original.type NOT IN ('world', 'project', 'country')
        AND original.project_id IS DISTINCT FROM s.project_id
        AND explore_copy.id <> original.id;
    `,
    [exploreProjectId],
  );
  log(`Repointed ${result.rowCount ?? '?'} anomaly survey_responses to explore`, t0);
};

const repointSurveyResponseDrafts = async (db, t0) => {
  const result = await db.runSql(`
    UPDATE survey_response_draft srd
    SET entity_id = target.id
    FROM survey s, entity original, entity target
    WHERE srd.survey_id = s.id
      AND original.id = srd.entity_id
      AND target.code = original.code
      AND target.project_id = s.project_id
      AND original.type NOT IN ('world', 'project', 'country')
      AND target.id <> original.id;
  `);
  log(`Repointed ${result.rowCount ?? '?'} survey_response_drafts`, t0);
};

const repointTasks = async (db, t0) => {
  const result = await db.runSql(`
    UPDATE task t
    SET entity_id = target.id
    FROM survey s, entity original, entity target
    WHERE t.survey_id = s.id
      AND original.id = t.entity_id
      AND target.code = original.code
      AND target.project_id = s.project_id
      AND original.type NOT IN ('world', 'project', 'country')
      AND target.id <> original.id;
  `);
  log(`Repointed ${result.rowCount ?? '?'} tasks`, t0);
};

// Three rows confirmed during refinement as admin-panel mis-clicks (see spec Q20).
// Cannot be restored by down() — we no longer have the data — accepted limitation.
const cleanupErroneousHygieneRows = async (db, t0) => {
  await db.runSql(`
    DELETE FROM user_entity_permission
    WHERE id IN ('5fa0cb6361f76a679a05c822', '5fb37ce361f76a7cdf03b81f');
  `);
  await db.runSql(`
    DELETE FROM access_request
    WHERE id = '5f9f54c461f76a679a048105';
  `);
  log('Cleaned up 3 erroneous data-hygiene rows', t0);
};

// Final lock: structural rows must have NULL project_id, sub-country rows must not.
// Applied at the end so the backfill above has a chance to populate every sub-country
// row first.
const applyProjectIdCheckConstraint = async (db, t0) => {
  await db.runSql(`
    ALTER TABLE entity ADD CONSTRAINT entity_project_id_check
      CHECK (
        (type IN ('world', 'project', 'country') AND project_id IS NULL)
        OR (type NOT IN ('world', 'project', 'country') AND project_id IS NOT NULL)
      );
  `);
  log('Applied CHECK constraint on entity.project_id', t0);
};

exports.up = async function (db) {
  const t0 = Date.now();
  log('Starting up data migration', t0);

  const exploreProjectId = await lookupExploreProject(db, t0);
  await backfillSingleProjectEntities(db, t0);
  await duplicateMultiProjectEntities(db, t0);
  await fixParentIdChains(db, t0);
  await backfillOrphans(db, t0, exploreProjectId);
  await repointSurveyResponses(db, t0);
  await repointAnomalySurveyResponses(db, t0, exploreProjectId);
  await repointSurveyResponseDrafts(db, t0);
  await repointTasks(db, t0);
  await cleanupErroneousHygieneRows(db, t0);
  await applyProjectIdCheckConstraint(db, t0);

  log('Data migration complete', t0);
};

// ----- down helpers -----

const dropProjectIdCheckConstraint = async (db, t0) => {
  await db.runSql(`ALTER TABLE entity DROP CONSTRAINT IF EXISTS entity_project_id_check;`);
  log('Dropped CHECK constraint', t0);
};

// Repoint survey_response rows that were redirected to a duplicate copy back to the
// original. Originals are entities sharing a code with a duplicate but lacking the
// duplicate flag.
const repointSurveyResponsesBackToOriginals = async (db, t0) => {
  await db.runSql(`
    UPDATE survey_response sr
    SET entity_id = original.id
    FROM entity duplicate
    JOIN entity original
      ON original.code = duplicate.code
      AND original.id <> duplicate.id
      AND COALESCE(original.metadata->>'duplicated_for_rn_1853', 'false') <> 'true'
    WHERE sr.entity_id = duplicate.id
      AND duplicate.metadata->>'duplicated_for_rn_1853' = 'true';
  `);
  log('Repointed survey_responses back to originals', t0);
};

const repointSurveyResponseDraftsBackToOriginals = async (db, t0) => {
  await db.runSql(`
    UPDATE survey_response_draft srd
    SET entity_id = original.id
    FROM entity duplicate
    JOIN entity original
      ON original.code = duplicate.code
      AND original.id <> duplicate.id
      AND COALESCE(original.metadata->>'duplicated_for_rn_1853', 'false') <> 'true'
    WHERE srd.entity_id = duplicate.id
      AND duplicate.metadata->>'duplicated_for_rn_1853' = 'true';
  `);
  log('Repointed survey_response_drafts back to originals', t0);
};

const repointTasksBackToOriginals = async (db, t0) => {
  await db.runSql(`
    UPDATE task t
    SET entity_id = original.id
    FROM entity duplicate
    JOIN entity original
      ON original.code = duplicate.code
      AND original.id <> duplicate.id
      AND COALESCE(original.metadata->>'duplicated_for_rn_1853', 'false') <> 'true'
    WHERE t.entity_id = duplicate.id
      AND duplicate.metadata->>'duplicated_for_rn_1853' = 'true';
  `);
  log('Repointed tasks back to originals', t0);
};

// Restore parent_id where a child's parent was repointed to a duplicate (those copies
// are about to be deleted; rewind to point at the original).
const restoreParentIdChains = async (db, t0) => {
  await db.runSql(`
    UPDATE entity child
    SET parent_id = original_parent.id
    FROM entity duplicate_parent
    JOIN entity original_parent
      ON original_parent.code = duplicate_parent.code
      AND original_parent.id <> duplicate_parent.id
      AND COALESCE(original_parent.metadata->>'duplicated_for_rn_1853', 'false') <> 'true'
    WHERE child.parent_id = duplicate_parent.id
      AND duplicate_parent.metadata->>'duplicated_for_rn_1853' = 'true';
  `);
  log('Restored parent_id chains', t0);
};

const deleteDuplicateEntityRows = async (db, t0) => {
  const result = await db.runSql(`
    DELETE FROM entity
    WHERE metadata->>'duplicated_for_rn_1853' = 'true';
  `);
  log(`Deleted ${result.rowCount ?? '?'} duplicate entity rows`, t0);
};

const stripMigrationMetadataFlags = async (db, t0) => {
  await db.runSql(`
    UPDATE entity
    SET metadata = metadata - 'orphaned'
    WHERE metadata ? 'orphaned';
  `);
  log('Stripped orphan metadata flags', t0);
};

exports.down = async function (db) {
  const t0 = Date.now();
  log('Starting down data migration', t0);

  await dropProjectIdCheckConstraint(db, t0);
  await repointSurveyResponsesBackToOriginals(db, t0);
  await repointSurveyResponseDraftsBackToOriginals(db, t0);
  await repointTasksBackToOriginals(db, t0);
  await restoreParentIdChains(db, t0);
  await deleteDuplicateEntityRows(db, t0);
  await stripMigrationMetadataFlags(db, t0);

  log('Down data migration complete', t0);
};

exports._meta = {
  version: 1,
  targets: ['server', 'browser'],
};
