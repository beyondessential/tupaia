'use strict';

import { generateId } from '../utilities';

var dbm;
var type;
var seed;

/**
 * RN-1853: Add project_id to entities and duplicate shared entities per project.
 * See llm/specs/RN-1853-refinement.md and RN-1853-implementation.md.
 *
 * Approach: Nullable Project & Country Entities.
 *  - world, project, country entities have NULL project_id (shared, not duplicated).
 *  - Sub-country entities (district, facility, individual, case, household, etc.)
 *    get NOT NULL project_id and are duplicated per project they appear in.
 */

const ORPHAN_PROJECT_CODE = 'explore';

// metadata flags applied during migration so we can identify rows for rollback or audit
const ORPHAN_FLAG = 'orphaned';
const DUPLICATE_FLAG = 'duplicated_for_rn_1853';
const ANOMALY_RESPONSE_FLAG = 'migrated_from_orphan_response';

const log = (msg, startTime) => {
  const elapsed = startTime ? ` (+${((Date.now() - startTime) / 1000).toFixed(1)}s)` : '';
  // eslint-disable-next-line no-console
  console.log(`[RN-1853]${elapsed} ${msg}`);
};

exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

// Kept as one file/transaction so the schema, data backfill, and constraints are atomic — partial application would leave the DB in an invalid intermediate state.
/**
 * Migration steps:
 *   1.  Add nullable project_id column + index, drop entity_code_key UNIQUE and dashboard FK
 *   2.  Look up explore project (fail-fast if missing)
 *   3.  Backfill project_id for single-project sub-country entities (UPDATE)
 *   4.  Duplicate multi-project sub-country entities (bulk INSERT)
 *   5.  Fix parent_id chains so children point at same-project parent copies
 *   6.  Backfill orphans (sub-country entities with no project mapping → explore)
 *   7.  Apply UNIQUE(code, project_id) — early so its index speeds up steps 8–11
 *   8.  Repoint survey_response.entity_id to per-project copy
 *   9.  Repoint anomalous survey_responses to explore-project copy
 *   10. Repoint survey_response_draft.entity_id
 *   11. Repoint task.entity_id
 *   12. Cleanup 3 erroneous project-pointing rows (admin-panel mis-clicks)
 *   13. Apply CHECK constraint on entity.project_id
 */
exports.up = async function (db) {
  const t0 = Date.now();
  log('Starting up migration', t0);

  // ---------- 1. Schema: add nullable project_id column + index ----------

  await db.runSql(`
    ALTER TABLE entity
      ADD COLUMN project_id TEXT REFERENCES project(id) ON DELETE RESTRICT;
  `);
  await db.runSql(`CREATE INDEX entity_project_id_idx ON entity(project_id);`);
  log('Step 1: added project_id column and index', t0);

  // Drop the global UNIQUE(code) constraint — it's superseded by UNIQUE(code, project_id)
  // applied later. Sub-country codes will repeat across projects. We must first drop the
  // dashboard.root_entity_code FK that depends on entity_code_key.
  // After this migration dashboard.root_entity_code is a soft text reference (not an enforced FK)
  // since entity.code is no longer globally unique.
  await db.runSql(`ALTER TABLE dashboard DROP CONSTRAINT IF EXISTS dashboard_root_entity_code_fkey;`);
  await db.runSql(`ALTER TABLE entity DROP CONSTRAINT IF EXISTS entity_code_key;`);
  log('Step 1b: dropped entity_code_key UNIQUE and dashboard FK', t0);

  // ---------- 2. Look up explore project (lazy — required only if there are orphans) ----------

  const exploreResult = await db.runSql(
    `SELECT id FROM project WHERE code = $1;`,
    [ORPHAN_PROJECT_CODE],
  );
  const exploreProjectId = exploreResult.rows[0]?.id ?? null;
  if (exploreProjectId) {
    log(`Step 2: explore project found (id=${exploreProjectId})`, t0);
  } else {
    log(
      `Step 2: explore project NOT found — OK on empty DB (e.g. test setup); will fail-fast later if orphan entities or anomaly survey_responses need it`,
      t0,
    );
  }

  // ---------- 3. Backfill project_id for single-project sub-country entities ----------

  const singleProjectResult = await db.runSql(`
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
  log(`Step 3: backfilled single-project entities (${singleProjectResult.rowCount ?? '?'} rows)`, t0);

  // ---------- 4. Duplicate multi-project sub-country entities ----------
  //
  // Original row keeps the lowest-ID project; one new row is inserted per remaining project.
  // Duplicates are tagged via metadata.duplicated_for_rn_1853 = true so we can find them in down().
  // Two bulk SQL statements via JS-built VALUES tables — far faster than per-row INSERTs over
  // a remote connection.

  const multiProjectEntities = await db.runSql(`
    SELECT entity.id, array_agg(DISTINCT p.id ORDER BY p.id) AS project_ids
    FROM entity
    JOIN entity_parent_child_relation epcr ON entity.id = epcr.child_id
    JOIN project p ON p.entity_hierarchy_id = epcr.entity_hierarchy_id
    WHERE entity.type NOT IN ('world', 'project', 'country')
    GROUP BY entity.id
    HAVING count(DISTINCT p.id) > 1;
  `);
  log(`Step 4: found ${multiProjectEntities.rows.length} multi-project entities`, t0);

  if (multiProjectEntities.rows.length > 0) {
    // First-project assignment: each multi-project entity's original row gets its lowest project
    const firstProjectAssignments = multiProjectEntities.rows
      .map(({ id, project_ids }) => `('${id}','${project_ids[0]}')`)
      .join(',');

    await db.runSql(`
      UPDATE entity
      SET project_id = m.project_id
      FROM (VALUES ${firstProjectAssignments}) AS m(entity_id, project_id)
      WHERE entity.id = m.entity_id;
    `);
    log(`Step 4a: assigned first project to ${multiProjectEntities.rows.length} originals`, t0);

    // Build (entity_id, project_id, new_id) triples for the N-1 copies per multi-project entity
    const copyTriples = [];
    for (const { id, project_ids } of multiProjectEntities.rows) {
      for (let i = 1; i < project_ids.length; i++) {
        copyTriples.push({ entity_id: id, project_id: project_ids[i], new_id: generateId() });
      }
    }

    if (copyTriples.length > 0) {
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
      log(`Step 4b: inserted ${copyTriples.length} duplicate rows`, t0);
    }
  }

  // ---------- 5. Fix parent_id chains within each project ----------
  //
  // After duplication, a child's parent_id may still point at the original (lowest-project)
  // copy of its parent. For children whose parent is a sub-country entity, repoint parent_id
  // at the same-project copy of the parent.
  //
  // Children whose parent is a structural entity (country/project/world) keep their parent_id
  // pointing at the shared row — no change needed.

  const parentFixResult = await db.runSql(`
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
  log(`Step 5: fixed parent_id chains (${parentFixResult.rowCount ?? '?'} rows)`, t0);

  // ---------- 6. Backfill orphans (sub-country entities with no project mapping) ----------

  const orphanCount = await db.runSql(`
    SELECT count(*)::int AS n FROM entity
    WHERE type NOT IN ('world', 'project', 'country') AND project_id IS NULL;
  `);
  const orphansToAssign = orphanCount.rows[0]?.n ?? 0;

  if (orphansToAssign > 0) {
    if (!exploreProjectId) {
      throw new Error(
        `RN-1853 migration aborted: ${orphansToAssign} orphan sub-country entities need a home but '${ORPHAN_PROJECT_CODE}' project is missing.`,
      );
    }
    const orphanResult = await db.runSql(
      `
        UPDATE entity
        SET project_id = $1,
            metadata = jsonb_set(COALESCE(metadata, '{}'::jsonb), $2, 'true'::jsonb)
        WHERE type NOT IN ('world', 'project', 'country')
          AND project_id IS NULL;
      `,
      [exploreProjectId, `{${ORPHAN_FLAG}}`],
    );
    log(`Step 6: assigned ${orphanResult.rowCount ?? '?'} orphans to explore project`, t0);
  } else {
    log('Step 6: no orphan entities to assign', t0);
  }

  // ---------- 7. Apply UNIQUE (code, project_id) ----------
  //
  // Applied early so the index it creates accelerates the join-on-(code, project_id) used by
  // the repoint UPDATEs in steps 8–11. Postgres treats NULL as distinct in unique constraints,
  // so structural entity rows (NULL project_id) are not uniqueness-checked — fine, codes are
  // already unique among those.

  await db.runSql(`
    ALTER TABLE entity ADD CONSTRAINT entity_code_project_id_unique
      UNIQUE (code, project_id);
  `);
  log('Step 7: applied UNIQUE(code, project_id) — creates btree index', t0);

  // ---------- 8. Repoint survey_response.entity_id to per-project copy ----------
  //
  // Standard re-point: survey's project IS in entity's hierarchy. The per-project copy of the
  // entity exists; point at it.

  const srRepointResult = await db.runSql(`
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
  log(`Step 8: repointed ${srRepointResult.rowCount ?? '?'} survey_responses`, t0);

  // ---------- 9. Repoint anomalous survey_responses to explore-project copy ----------
  //
  // Anomalies: survey's project is NOT in entity's hierarchy. After step 8 these still point
  // at the original (now in some unrelated project). Redirect to explore copy.
  //
  // Note: we don't tag these with a metadata flag (survey_response.metadata is text not jsonb).
  // They can be identified post-migration by joining survey_response to entity to project where
  // entity.project_id = explore but survey.project_id is something else.

  if (exploreProjectId) {
    const anomalyResult = await db.runSql(
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
    log(`Step 9: repointed ${anomalyResult.rowCount ?? '?'} anomaly survey_responses to explore`, t0);
  } else {
    log('Step 9: skipped (no explore project — no anomalies to redirect)', t0);
  }

  // ---------- 10. Repoint survey_response_draft.entity_id ----------

  const draftResult = await db.runSql(`
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
  log(`Step 10: repointed ${draftResult.rowCount ?? '?'} survey_response_drafts`, t0);

  // ---------- 11. Repoint task.entity_id (via task.survey_id → survey.project_id) ----------

  const taskResult = await db.runSql(`
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
  log(`Step 11: repointed ${taskResult.rowCount ?? '?'} tasks`, t0);

  // ---------- 12. Cleanup erroneous project-pointing rows ----------
  //
  // Three rows confirmed during refinement as admin-panel mis-clicks (see spec Q20).

  await db.runSql(`
    DELETE FROM user_entity_permission
    WHERE id IN ('5fa0cb6361f76a679a05c822', '5fb37ce361f76a7cdf03b81f');
  `);
  await db.runSql(`
    DELETE FROM access_request
    WHERE id = '5f9f54c461f76a679a048105';
  `);
  log('Step 12: cleaned up 3 erroneous data-hygiene rows', t0);

  // ---------- 13. Apply CHECK constraint ----------

  await db.runSql(`
    ALTER TABLE entity ADD CONSTRAINT entity_project_id_check
      CHECK (
        (type IN ('world', 'project', 'country') AND project_id IS NULL)
        OR (type NOT IN ('world', 'project', 'country') AND project_id IS NOT NULL)
      );
  `);
  log('Step 13: applied CHECK constraint on entity.project_id', t0);

  log('Migration complete', t0);
};

exports.down = async function (db) {
  const t0 = Date.now();
  log('Starting down migration', t0);

  // Reverse in inverse order. Note: the 3 deleted hygiene rows from step 12 cannot
  // be restored (we no longer have the data) — accepted limitation.

  await db.runSql(`ALTER TABLE entity DROP CONSTRAINT IF EXISTS entity_project_id_check;`);
  await db.runSql(`ALTER TABLE entity DROP CONSTRAINT IF EXISTS entity_code_project_id_unique;`);
  log('Dropped constraints', t0);

  // Repoint survey_response, drafts, tasks back to the original (non-duplicate) entity row.
  // Originals are entities with the same code but without the duplicate flag.

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

  // Restore parent_id where the parent's same-project copy was a duplicate (those copies
  // are about to be deleted; rewind the parent_id to point at the original).
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

  // Delete duplicated entity rows
  const delResult = await db.runSql(`
    DELETE FROM entity
    WHERE metadata->>'duplicated_for_rn_1853' = 'true';
  `);
  log(`Deleted ${delResult.rowCount ?? '?'} duplicate entity rows`, t0);

  // Strip migration metadata flags from remaining rows
  await db.runSql(`
    UPDATE entity
    SET metadata = metadata - 'orphaned'
    WHERE metadata ? 'orphaned';
  `);
  log('Stripped orphan metadata flags', t0);

  // Drop index and column
  await db.runSql(`DROP INDEX IF EXISTS entity_project_id_idx;`);
  await db.runSql(`ALTER TABLE entity DROP COLUMN IF EXISTS project_id;`);
  log('Dropped project_id column and index', t0);

  // Restore the global UNIQUE(code) constraint and the dashboard FK that depended on it
  await db.runSql(`ALTER TABLE entity ADD CONSTRAINT entity_code_key UNIQUE (code);`);
  await db.runSql(`
    ALTER TABLE dashboard
      ADD CONSTRAINT dashboard_root_entity_code_fkey
      FOREIGN KEY (root_entity_code) REFERENCES entity(code) ON UPDATE CASCADE ON DELETE RESTRICT;
  `);
  log('Restored entity_code_key UNIQUE and dashboard FK', t0);

  log('Down migration complete', t0);
};

exports._meta = {
  version: 1,
  targets: ['server', 'browser'],
};
