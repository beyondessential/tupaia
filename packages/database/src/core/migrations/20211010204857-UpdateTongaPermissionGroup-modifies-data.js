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
  const permissionGroupQueryResult = await db.runSql(`
  SELECT id FROM permission_group WHERE name = 'Community Health Senior';
  `);
  const [permissionGroup] = permissionGroupQueryResult.rows;
  const permissionGroupId = permissionGroup.id;

  await db.runSql(`
  UPDATE permission_group SET name = 'Tonga Community Health Senior' WHERE id='${permissionGroupId}';
  `);
};

exports.down = async function (db) {
  const permissionGroupQueryResult = await db.runSql(`
  SELECT id FROM permission_group WHERE name = 'Tonga Community Health Senior';
  `);
  const [permissionGroup] = permissionGroupQueryResult.rows;
  const permissionGroupId = permissionGroup.id;

  await db.runSql(`
  UPDATE permission_group SET name = 'Community Health Senior' WHERE id='${permissionGroupId}';
  `);
};

exports._meta = {
  version: 1,
};
