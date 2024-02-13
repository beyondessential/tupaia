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
  await db.runSql(`
    DELETE FROM user_entity_permission
    WHERE 
      user_id  IS NULL
      OR entity_id IS NULL
      OR permission_group_id IS NULL;
  `);
  return db.runSql(`
    ALTER TABLE user_entity_permission ALTER COLUMN user_id SET NOT NULL;
    ALTER TABLE user_entity_permission ALTER COLUMN entity_id SET NOT NULL;
    ALTER TABLE user_entity_permission ALTER COLUMN permission_group_id SET NOT NULL;
  `);
};

exports.down = function (db) {
  return db.runSql(`
    ALTER TABLE user_entity_permission ALTER COLUMN user_id DROP NOT NULL;
    ALTER TABLE user_entity_permission ALTER COLUMN entity_id DROP NOT NULL;
    ALTER TABLE user_entity_permission ALTER COLUMN permission_group_id DROP NOT NULL;
`);
};

exports._meta = {
  version: 1,
};
