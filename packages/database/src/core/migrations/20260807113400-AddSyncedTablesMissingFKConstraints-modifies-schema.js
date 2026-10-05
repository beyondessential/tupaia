'use strict';

var dbm;
var type;
var seed;

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

/**
 * Companion to 20260807113353-AddMissingFKConstraints, split out because both project and
 * entity sync to DataTrak web clients, so the constraint should be enforced there too.
 *
 * ON UPDATE CASCADE and ON DELETE RESTRICT to match the rest of that set. The browser
 * database already carries an equivalent unenforced-until-now reference in
 * project.entity_hierarchy_id, so this does not introduce a new ordering requirement on
 * how synced rows are applied.
 */
exports.up = async function (db) {
  await db.runSql(`
    ALTER TABLE project
      ADD CONSTRAINT project_entity_id_fkey
      FOREIGN KEY (entity_id) REFERENCES entity(id)
      ON UPDATE CASCADE ON DELETE RESTRICT;
  `);
};

exports.down = async function (db) {
  await db.runSql('ALTER TABLE project DROP CONSTRAINT IF EXISTS project_entity_id_fkey;');
};

exports._meta = {
  version: 1,
  targets: ['browser', 'server'],
};
