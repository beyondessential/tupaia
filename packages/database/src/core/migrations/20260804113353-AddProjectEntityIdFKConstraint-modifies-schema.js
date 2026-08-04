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

exports.up = async function (db) {
  await db.runSql(
    'ALTER TABLE project ADD CONSTRAINT project_entity_id_fkey FOREIGN KEY (entity_id) REFERENCES entity(id);',
  );
};

exports.down = async function (db) {
  await db.runSql('ALTER TABLE project DROP CONSTRAINT project_entity_id_fkey;');
};

exports._meta = {
  version: 1,
  targets: ['browser', 'server'],
};
