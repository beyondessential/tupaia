'use strict';

var dbm;
var type;
var seed;

exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

const log = msg => {
  // eslint-disable-next-line no-console
  console.log(`[Orphan entity cleanup] ${msg}`);
};

exports.up = async function (db) {
  // 1. Rescue orphans that live data still points at. Orphans are entities the
  //    RN-1853 backfill found no entity_parent_child_relation rows for — mostly
  //    dead imports, but some were created on the fly by DataTrak survey
  //    submissions and never entered the cache (trigger gap; some types also
  //    aren't in the hierarchy's canonical_types). If a survey_response / task /
  //    survey_response_draft points at the orphan, its survey's project wins —
  //    computed dynamically so orphans claimed after this snapshot are still
  //    rescued on prod (deleting them would abort on the survey_response FK).
  //    The project-belonging orphans previously repatriated via a hand-audited
  //    (country, type) → project mapping are now cleaned up directly on prod, so
  //    on a fresh clone they're no longer orphaned and don't need that mapping.
  const rescued = await db.runSql(`
    WITH claiming_project AS (
      SELECT DISTINCT ON (r.entity_id) r.entity_id, s.project_id
      FROM (
        SELECT entity_id, survey_id FROM survey_response
        UNION ALL
        SELECT entity_id, survey_id FROM task
        UNION ALL
        SELECT entity_id, survey_id FROM survey_response_draft
      ) r
      JOIN survey s ON s.id = r.survey_id
      JOIN project p ON p.id = s.project_id AND p.code <> 'explore'
      ORDER BY r.entity_id, s.project_id
    )
    UPDATE entity e
    SET project_id = c.project_id,
        metadata = jsonb_set(
          e.metadata - 'orphaned',
          '{repatriated_from_orphan}'::text[],
          'true'::jsonb
        )
    FROM claiming_project c
    WHERE e.id = c.entity_id
      AND e.metadata->>'orphaned' = 'true';
  `);
  log(`Rescued ${rescued.rowCount ?? '?'} orphans into their projects`);

  // 2a. Re-point rescued entities whose original parent lives in another
  //     project but has a same-code copy (RN-1853 duplicate) in the entity's
  //     new project — e.g. PG hospital_wards whose parent hospital was
  //     duplicated into png_health_audit. Keeps the real hierarchy instead of
  //     flattening to country. (code, project_id) is unique, so at most one
  //     copy matches.
  const reParented = await db.runSql(`
    UPDATE entity e
    SET parent_id = copy.id
    FROM entity parent, entity copy
    WHERE e.metadata->>'repatriated_from_orphan' = 'true'
      AND parent.id = e.parent_id
      AND parent.project_id IS NOT NULL
      AND parent.project_id <> e.project_id
      AND copy.code = parent.code
      AND copy.project_id = e.project_id
      AND copy.id <> e.id;
  `);
  log(`Re-pointed ${reParented.rowCount ?? '?'} rescued entities to same-project parent copies`);

  // 2b. Re-home the rest — rescued entities whose parent is missing or lives in
  //     another project with no same-project copy — under their country's
  //     shared row, so they're reachable in the new project without
  //     cross-project edges. Orphan → orphan parent chains that moved to the
  //     same project together (e.g. ML facility → sub_district → district) are
  //     left intact.
  const reHomed = await db.runSql(`
    UPDATE entity e
    SET parent_id = country.id
    FROM entity country
    WHERE e.metadata->>'repatriated_from_orphan' = 'true'
      AND country.code = e.country_code
      AND country.type = 'country'
      AND country.project_id IS NULL
      AND (e.parent_id IS NULL OR EXISTS (
        SELECT 1 FROM entity parent
        WHERE parent.id = e.parent_id
          AND parent.project_id IS NOT NULL
          AND parent.project_id <> e.project_id
      ));
  `);
  log(`Re-homed ${reHomed.rowCount ?? '?'} rescued entities under their country`);

  // 3. Purge stale closure-cache rows for everything touched: rescued entities
  //    (their explore-era rows are wrong; the cache rebuilds under the new
  //    project on next server start) and the delete set (FK requires it before
  //    the DELETE below).
  const cachePurged = await db.runSql(`
    DELETE FROM ancestor_descendant_relation adr
    USING entity e
    WHERE (adr.descendant_id = e.id OR adr.ancestor_id = e.id)
      AND (e.metadata->>'orphaned' = 'true'
           OR e.metadata->>'repatriated_from_orphan' = 'true');
  `);
  log(`Purged ${cachePurged.rowCount ?? '?'} stale closure-cache rows`);

  // 4. Hard-delete every remaining orphan — the Laos/Cambodia bulk plus the
  //    audit-confirmed deletes (AU documents, DL test entities, KI traps,
  //    SB/PG fetp_graduates, ...). Verified: none have
  //    survey_response/task/survey_response_draft rows or children outside the
  //    set, so a single DELETE removes whole subtrees cleanly.
  const dropped = await db.runSql(`
    DELETE FROM entity
    WHERE metadata->>'orphaned' = 'true';
  `);
  log(`Hard-deleted ${dropped.rowCount ?? '?'} orphan entities`);
};

exports.down = async function () {
  log('down() is a no-op — orphan deletion, repatriation and reassignment are not reverted');
};

exports._meta = {
  version: 1,
  targets: ['server'],
};
