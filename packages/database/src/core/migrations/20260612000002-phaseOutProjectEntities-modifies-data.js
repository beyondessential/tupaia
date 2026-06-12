'use strict';

var dbm;
var type;
var seed;

/**
 * Removes the `type = 'project'` entities. Post-epic a project's countries come
 * from `project_country` and its hierarchy root is the project record itself, so
 * the project entity is a redundant hierarchy-era anomaly.
 *
 * Steps:
 *   1. Backfill project.name from the project entity (fall back to code).
 *   2. Re-point the closure cache: rows whose ancestor was the project entity now
 *      point at the project id (matching the new project_country hierarchy edge).
 *   3. Detach children (countries) that still point at a project entity via
 *      parent_id — countries reach their project via project_country, not parent_id.
 *   4. Delete the project entities.
 */

exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

const log = msg => {
  // eslint-disable-next-line no-console
  console.log(`[Phase out project entities] ${msg}`);
};

exports.up = async function (db) {
  await db.runSql(`
    UPDATE project p
      SET name = e.name
      FROM entity e
      WHERE e.id = p.entity_id AND p.name IS NULL;
  `);
  await db.runSql(`UPDATE project SET name = code WHERE name IS NULL;`);

  const rePointed = await db.runSql(`
    UPDATE ancestor_descendant_relation adr
      SET ancestor_id = p.id
      FROM project p
      WHERE adr.ancestor_id = p.entity_id;
  `);
  log(`Re-pointed ${rePointed.rowCount ?? '?'} closure rows onto the project id`);

  const detached = await db.runSql(`
    UPDATE entity
      SET parent_id = NULL
      WHERE parent_id IN (SELECT id FROM entity WHERE type = 'project');
  `);
  log(`Detached ${detached.rowCount ?? '?'} children from project entities`);

  const dropped = await db.runSql(`DELETE FROM entity WHERE type = 'project';`);
  log(`Deleted ${dropped.rowCount ?? '?'} project entities`);
};

exports.down = async function () {
  log('down() is a no-op — deleted project entities are not resurrected');
};

exports._meta = {
  version: 1,
  targets: ['server'],
};
