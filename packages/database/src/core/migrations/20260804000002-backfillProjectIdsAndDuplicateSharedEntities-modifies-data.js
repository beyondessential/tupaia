'use strict';

import { generateId } from '../utilities';

var dbm;
var type;
var seed;

const ORPHAN_PROJECT_CODE = 'explore';

const ORPHAN_FLAG = 'orphaned';
const DUPLICATE_FLAG = 'duplicated_for_rn_1853';

const BULK_VALUES_BATCH_SIZE = 5000;

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

const lookupExploreProject = async (db, t0) => {
  const result = await db.runSql(`SELECT id FROM project WHERE code = $1;`, [ORPHAN_PROJECT_CODE]);
  const exploreProjectId = result.rows[0]?.id ?? null;
  if (exploreProjectId) {
    log(`Explore project found (id=${exploreProjectId})`, t0);
  } else {
    log(
      `Explore project NOT found — OK on empty DB; orphan/anomaly steps will fail-fast if needed`,
      t0,
    );
  }
  return exploreProjectId;
};

// Build a temp table mapping each sub-country entity to every project it
// belongs to, taken directly from entity_parent_child_relation (EPCR) — the
// source of truth pre-migration for "which project does an entity appear in".
// EPCR's per-project node set is authoritative, so we seed from both sides of
// its edges (children + parents) and do NOT expand further up entity.parent_id;
// see the inline note below for why walking the canonical chain pulled phantom
// ancestors into projects whose entity_relation overlay had bypassed them.
const buildEntityProjectMap = async (db, t0) => {
  await db.runSql(`
    CREATE TEMP TABLE entity_in_project (
      entity_id  TEXT NOT NULL,
      project_id TEXT NOT NULL,
      PRIMARY KEY (entity_id, project_id)
    ) ON COMMIT DROP;

    INSERT INTO entity_in_project (entity_id, project_id)
    -- A project's set is exactly the sub-country entities that appear in its
    -- EPCR, either as a child OR as a parent. EPCR is the authoritative
    -- per-project hierarchy (built from BOTH canonical entity.parent_id and
    -- entity_relation overlays), so its node set IS the set of entities that
    -- belong to each project.
    --
    -- The parent side matters for non-canonical hierarchies (e.g.
    -- ehealth_samoa's facility→sub_district edges) where a parent might never
    -- appear as a child in EPCR but still needs duplicating into the project
    -- so setParentIdsFromEpcr can find a same-project copy to wire up.
    --
    -- We deliberately do NOT walk entity.parent_id upward beyond EPCR. Doing so
    -- pulled in canonical ancestors that an entity_relation overlay had
    -- deliberately bypassed (e.g. kiuar_palau / ok_palau, where sub_districts
    -- sit directly under the country, not under their canonical facility →
    -- district chain), duplicating phantom district/facility entities into
    -- projects that never contained them (TUP-3165 issues 19–22, plus the
    -- Olangch duplicate-district regression). EPCR already enumerates every
    -- entity each project's hierarchy reaches, so the two seeds below are
    -- complete on their own.
    SELECT DISTINCT entity.id AS entity_id, p.id AS project_id
    FROM entity
    JOIN entity_parent_child_relation epcr ON entity.id = epcr.child_id
    JOIN project p ON p.entity_hierarchy_id = epcr.entity_hierarchy_id
    WHERE entity.type NOT IN ('world', 'project', 'country')

    UNION

    SELECT DISTINCT entity.id, p.id
    FROM entity
    JOIN entity_parent_child_relation epcr ON entity.id = epcr.parent_id
    JOIN project p ON p.entity_hierarchy_id = epcr.entity_hierarchy_id
    WHERE entity.type NOT IN ('world', 'project', 'country');

    CREATE INDEX ON entity_in_project (entity_id);
    CREATE INDEX ON entity_in_project (project_id);
    ANALYZE entity_in_project;
  `);
  const countResult = await db.runSql(`SELECT count(*)::int AS n FROM entity_in_project;`);
  log(`Built entity_in_project map (${countResult.rows[0]?.n ?? '?'} (entity, project) rows)`, t0);
};

const backfillSingleProjectEntities = async (db, t0) => {
  const result = await db.runSql(`
    UPDATE entity
    SET project_id = sub.project_id
      FROM (
      SELECT entity_id, MIN(project_id) AS project_id
      FROM entity_in_project
      GROUP BY entity_id
      HAVING count(DISTINCT project_id) = 1
    ) sub
    WHERE entity.id = sub.entity_id;
  `);
  log(`Backfilled single-project entities (${result.rowCount ?? '?'} rows)`, t0);
};

const duplicateMultiProjectEntities = async (db, t0) => {
  const multiProjectEntities = await db.runSql(`
    SELECT entity_id AS id, array_agg(DISTINCT project_id ORDER BY project_id) AS project_ids
    FROM entity_in_project
    GROUP BY entity_id
    HAVING count(DISTINCT project_id) > 1;
  `);
  log(`Found ${multiProjectEntities.rows.length} multi-project entities`, t0);

  if (multiProjectEntities.rows.length === 0) return;

  const totalFirstAssignmentBatches = Math.ceil(
    multiProjectEntities.rows.length / BULK_VALUES_BATCH_SIZE,
  );
  for (let i = 0; i < multiProjectEntities.rows.length; i += BULK_VALUES_BATCH_SIZE) {
    const batch = multiProjectEntities.rows.slice(i, i + BULK_VALUES_BATCH_SIZE);
    const values = batch.map(({ id, project_ids }) => `('${id}','${project_ids[0]}')`).join(',');
    await db.runSql(`
      UPDATE entity
      SET project_id = m.project_id
        FROM (VALUES ${values}) AS m(entity_id, project_id)
      WHERE entity.id = m.entity_id;
    `);
    const batchNum = Math.floor(i / BULK_VALUES_BATCH_SIZE) + 1;
    log(
      `  first-project assignment batch ${batchNum}/${totalFirstAssignmentBatches} (${batch.length} rows)`,
      t0,
    );
  }
  log(`Assigned first project to ${multiProjectEntities.rows.length} originals`, t0);

  const copyTriples = [];
  for (const { id, project_ids } of multiProjectEntities.rows) {
    for (let i = 1; i < project_ids.length; i++) {
      copyTriples.push({ entity_id: id, project_id: project_ids[i], new_id: generateId() });
    }
  }
  if (copyTriples.length === 0) return;

  for (let i = 0; i < copyTriples.length; i += BULK_VALUES_BATCH_SIZE) {
    const batch = copyTriples.slice(i, i + BULK_VALUES_BATCH_SIZE);
    const values = batch
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
             JOIN (VALUES ${values}) AS m(entity_id, project_id, new_id) ON e.id = m.entity_id;
    `);
  }
  log(`Inserted ${copyTriples.length} duplicate rows`, t0);
};

// Set entity.parent_id from EPCR for every sub-country entity. EPCR is the
// authoritative per-project hierarchy view
const setParentIdsFromEpcr = async (db, t0) => {
  const result = await db.runSql(`
    WITH desired AS (
      SELECT
        child.id  AS child_id,
        CASE
          -- Structural parents are shared (project_id IS NULL); point at the source row.
          WHEN epcr_parent.type IN ('world', 'project', 'country') THEN structural_parent.id
          -- Sub-country parents need the same-project copy.
          ELSE same_project_parent.id
        END AS new_parent_id
      FROM entity child
      JOIN project proj ON proj.id = child.project_id
      JOIN entity_parent_child_relation epcr
        ON epcr.entity_hierarchy_id = proj.entity_hierarchy_id
      JOIN entity canonical_child
        ON canonical_child.id = epcr.child_id
       AND canonical_child.code = child.code
      JOIN entity epcr_parent ON epcr_parent.id = epcr.parent_id
      LEFT JOIN entity structural_parent
        ON structural_parent.code = epcr_parent.code
       AND structural_parent.project_id IS NULL
       AND structural_parent.type IN ('world', 'project', 'country')
      LEFT JOIN entity same_project_parent
        ON same_project_parent.code = epcr_parent.code
       AND same_project_parent.project_id = proj.id
      WHERE child.type NOT IN ('world', 'project', 'country')
    )
    UPDATE entity
    SET parent_id = d.new_parent_id
    FROM desired d
    WHERE entity.id = d.child_id
      AND d.new_parent_id IS NOT NULL
      AND entity.parent_id IS DISTINCT FROM d.new_parent_id;
  `);
  log(`Aligned parent_id with EPCR for ${result.rowCount ?? '?'} entities`, t0);
};

// Catch-all generic same-project realignment.
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
  log(`Fixed cross-project parent_id chains (${result.rowCount ?? '?'} rows)`, t0);
};

// Sanity check: after setParentIdsFromEpcr + backfillOrphans, every sub-country
// entity should have a same-project parent or a structural (world/project/
// country) shared parent. Any remaining cross-project parent_id is a bug — fail
// loudly rather than silently produce broken closure caches.
const assertNoCrossProjectParents = async (db, t0) => {
  const result = await db.runSql(`
    SELECT count(*)::int AS n
    FROM entity child
    JOIN entity parent ON parent.id = child.parent_id
    WHERE child.project_id IS NOT NULL
      AND parent.project_id IS NOT NULL
      AND child.project_id <> parent.project_id;
  `);
  const n = result.rows[0]?.n ?? 0;
  if (n > 0) {
    // Dump the offenders to the migration log so we can diagnose even when the
    // surrounding transaction rolls back on throw.
    const offenders = await db.runSql(`
      SELECT child.code AS child_code, child.type AS child_type,
             cp.code AS child_project,
             parent.code AS parent_code, parent.type AS parent_type,
             pp.code AS parent_project,
             child.metadata->>'orphaned' AS child_orphaned,
             child.metadata->>'duplicated_for_rn_1853' AS child_duplicated
      FROM entity child
      JOIN entity parent ON parent.id = child.parent_id
      LEFT JOIN project cp ON cp.id = child.project_id
      LEFT JOIN project pp ON pp.id = parent.project_id
      WHERE child.project_id IS NOT NULL
        AND parent.project_id IS NOT NULL
        AND child.project_id <> parent.project_id
      ORDER BY child.type, child.code
      LIMIT 20;
    `);
    log(`Cross-project parent offenders (showing up to 20):`, t0);
    offenders.rows.forEach(r =>
      log(
        `  ${r.child_type} ${r.child_code} [proj=${r.child_project}, orphan=${r.child_orphaned}, dup=${r.child_duplicated}] ` +
          `-> parent ${r.parent_type} ${r.parent_code} [proj=${r.parent_project}]`,
        t0,
      ),
    );
    throw new Error(
      `RN-1853 migration aborted: ${n} entities still have cross-project parent_id (see log above).`,
    );
  }
  log(`Verified no cross-project parent_id remains`, t0);
};

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

  // Orphans inherit their pre-migration parent_id, which often points at an
  // entity now living in some other project — would silently produce
  // cross-project edges in the closure cache. Re-point to the country (shared,
  // project_id IS NULL) so they're at least reachable in the explore hierarchy
  // without crossing projects.
  const rewireResult = await db.runSql(
    `
      UPDATE entity orphan
      SET parent_id = country.id
      FROM entity parent, entity country
      WHERE orphan.parent_id = parent.id
        AND orphan.project_id = $1
        AND parent.project_id IS NOT NULL
        AND parent.project_id <> orphan.project_id
        AND orphan.country_code IS NOT NULL
        AND country.code = orphan.country_code
        AND country.type = 'country'
        AND country.project_id IS NULL;
    `,
    [exploreProjectId],
  );
  log(`Re-pointed ${rewireResult.rowCount ?? '?'} orphan parent_ids to their country`, t0);
};

// Refresh planner statistics before the repoint phase. Steps above insert ~100k+
// entity rows and update parent_id chains; without ANALYZE the planner picks a bad
// plan for the four-table joins below (observed: 15 min on 400k survey_response).
const refreshStatistics = async (db, t0) => {
  await db.runSql(`ANALYZE entity, survey, survey_response, survey_response_draft, task;`);
  log('Refreshed planner statistics', t0);
};

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

const auditUnrepointedSurveyResponses = async (db, t0) => {
  const result = await db.runSql(`
    SELECT count(*)::int AS n
    FROM survey_response sr
           JOIN survey s ON sr.survey_id = s.id
           JOIN entity e ON sr.entity_id = e.id
    WHERE e.type NOT IN ('world', 'project', 'country')
      AND e.project_id IS DISTINCT FROM s.project_id;
  `);
  const remaining = result.rows[0]?.n ?? 0;
  if (remaining > 0) {
    log(
      `WARNING: ${remaining} survey_responses still reference an entity outside their survey's project — manual review required`,
      t0,
    );
  } else {
    log('All survey_responses now reference entities in their survey project', t0);
  }
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

const clearStaleClosureCaches = async (db, t0) => {
  // TRUNCATE is near-instant regardless of size and avoids the WAL/trigger
  // overhead of per-row DELETE on these multi-million-row tables.
  await db.runSql(`TRUNCATE ancestor_descendant_relation;`);
  await db.runSql(`TRUNCATE entity_parent_child_relation;`);
  log('Cleared stale closure caches — will rebuild on next server start', t0);
};

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
  await buildEntityProjectMap(db, t0);
  await backfillSingleProjectEntities(db, t0);
  await duplicateMultiProjectEntities(db, t0);
  await setParentIdsFromEpcr(db, t0);
  await fixParentIdChains(db, t0);
  // Orphans get assigned to explore AND have their parent_id rewired to their
  // country before we assert, otherwise the assertion would miss
  // cross-project edges introduced by orphan-park.
  await backfillOrphans(db, t0, exploreProjectId);
  await assertNoCrossProjectParents(db, t0);
  await refreshStatistics(db, t0);
  await repointSurveyResponses(db, t0);
  await repointAnomalySurveyResponses(db, t0, exploreProjectId);
  await auditUnrepointedSurveyResponses(db, t0);
  await repointSurveyResponseDrafts(db, t0);
  await repointTasks(db, t0);
  await cleanupErroneousHygieneRows(db, t0);
  await clearStaleClosureCaches(db, t0);
  await applyProjectIdCheckConstraint(db, t0);

  log('Data migration complete', t0);
};

const dropProjectIdCheckConstraint = async (db, t0) => {
  await db.runSql(`ALTER TABLE entity DROP CONSTRAINT IF EXISTS entity_project_id_check;`);
  log('Dropped CHECK constraint', t0);
};

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
  targets: ['server'],
};
