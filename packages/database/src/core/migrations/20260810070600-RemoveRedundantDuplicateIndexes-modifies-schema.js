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
 * `entity.code` and `permission_group.name` have UNIQUE constraints, so already have unique
 * indexes that will always be preferred over these ones.
 */
exports.up = async function (db) {
  await db.runSql('DROP INDEX IF EXISTS entity_code;');
  await db.runSql('DROP INDEX IF EXISTS permission_group_name_idx;');
};

exports.down = async function (db) {
  await db.runSql('CREATE INDEX IF NOT EXISTS entity_code ON entity (code);');
  await db.runSql(
    'CREATE INDEX IF NOT EXISTS permission_group_name_idx ON permission_group (name);',
  );
};

exports._meta = {
  version: 1,
  targets: ['browser', 'server'],
};
