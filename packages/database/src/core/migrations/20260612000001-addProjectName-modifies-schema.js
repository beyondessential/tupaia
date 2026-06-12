'use strict';

var dbm;
var type;
var seed;

/**
 * First step of phasing out `type = 'project'` entities. The project's display
 * name lived on its entity; move it onto the project table so a project is
 * represented purely by the project record + its project_country links.
 *
 * Also drops the `ancestor_descendant_relation.ancestor_id` → entity foreign key:
 * the closure cache now stores the project id (not a project entity id) as the
 * ancestor of a project's countries, which is not an entity. The FK was also
 * ON DELETE CASCADE, so it has to go before the project entities are removed.
 */

exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = async function (db) {
  await db.runSql(`ALTER TABLE project ADD COLUMN IF NOT EXISTS name TEXT;`);
  await db.runSql(`
    ALTER TABLE ancestor_descendant_relation
      DROP CONSTRAINT IF EXISTS ancestor_descendant_relation_ancestor_id_entity_id_fk;
  `);
};

exports.down = async function (db) {
  await db.runSql(`ALTER TABLE project DROP COLUMN IF EXISTS name;`);
  // The ancestor_id FK is not re-added: once the project root is keyed by project
  // id the column is intentionally polymorphic, so the constraint can't hold.
};

exports._meta = {
  version: 1,
  targets: ['server'],
};
