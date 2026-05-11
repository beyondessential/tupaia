'use strict';

import { generateId } from '../utilities';

var dbm;
var type;
var seed;

/**
 * TUP-3065 data migration: backfill `project_country` from existing
 * `entity_relation` rows, then mark this work done.
 *
 * Pre-existing project↔country mapping lives in `entity_relation` rows where the
 * parent is a `project`-type entity and the child is a `country`-type entity. We
 * mirror those into `project_country`, joining via `project.entity_id` to find the
 * matching project row.
 *
 * Filename suffix `-modifies-data.js` is recognised by setupNewDatabase.sh and
 * skipped on empty test DBs (no entity_relation rows to migrate).
 */

const log = (msg, startTime) => {
  const elapsed = startTime ? ` (+${((Date.now() - startTime) / 1000).toFixed(1)}s)` : '';
  // eslint-disable-next-line no-console
  console.log(`[TUP-3065 project_country]${elapsed} ${msg}`);
};

exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = async function (db) {
  const t0 = Date.now();
  log('Starting up data migration', t0);

  // Source rows: project↔country pairs derived from entity_relation, keyed by
  // (project.id, country.id). DISTINCT collapses any duplicates from custom hierarchies
  // (different entity_hierarchy_id pointing at the same project).
  const sourceRows = await db.runSql(`
    SELECT DISTINCT p.id AS project_id, c.id AS country_id
    FROM entity_relation er
    JOIN entity p_entity ON p_entity.id = er.parent_id AND p_entity.type = 'project'
    JOIN entity c ON c.id = er.child_id AND c.type = 'country'
    JOIN project p ON p.entity_id = p_entity.id;
  `);
  log(`Found ${sourceRows.rows.length} project↔country pairs to backfill`, t0);

  if (sourceRows.rows.length > 0) {
    // Single bulk INSERT — the row count here is small (one per project per country, low
    // hundreds at prod scale), so a single VALUES clause is fine.
    const values = sourceRows.rows
      .map(({ project_id, country_id }) => `('${generateId()}','${project_id}','${country_id}')`)
      .join(',');
    await db.runSql(`
      INSERT INTO project_country (id, project_id, country_id)
      VALUES ${values}
      ON CONFLICT (project_id, country_id) DO NOTHING;
    `);
    log(`Inserted ${sourceRows.rows.length} project_country rows`, t0);
  }

  // Invalidate the closure cache. Pre-3068 rows reference entity ids that RN-1853
  // duplicated/replaced, so they're stale by the time this migration runs. Wiping
  // here lets central-server's bootstrap (buildEntityParentChildRelationIfEmpty) see
  // an empty cache on next boot and trigger AncestorDescendantCacheBuilder.rebuildAll, which
  // walks entity.parent_id + project_country to repopulate from the current state.
  // No-op on an empty test DB.
  await db.runSql(`TRUNCATE ancestor_descendant_relation;`);
  log('Truncated ancestor_descendant_relation — bootstrap will rebuild', t0);

  log('Data migration complete', t0);
};

exports.down = async function (db) {
  await db.runSql(`DELETE FROM project_country;`);
};

exports._meta = {
  version: 1,
  targets: ['server', 'browser'],
};
