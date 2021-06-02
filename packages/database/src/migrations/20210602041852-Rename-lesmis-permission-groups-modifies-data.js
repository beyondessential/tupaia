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

const updatePermissionGroupName = function (db, oldName, newName) {
  return db.runSql(`
  UPDATE "permission_group"
  SET "name" = '${newName}'
  WHERE "name" = '${oldName}'
  `);
};

const updatePermissionGroupParent = function (db, name, newParentId) {
  return db.runSql(`
  UPDATE "permission_group"
  SET "parent_id" = '${newParentId}'
  WHERE "name" = '${name}'
  `);
};

exports.up = async function (db) {
  await updatePermissionGroupName(db, 'Laos Schools Admin', 'LESMIS Admin');
  await updatePermissionGroupName(db, 'Laos Schools Super User', 'LESMIS User');

  const LESMIS_ADMIN_ID = '607e36bf61f76a40c6000a23';
  await updatePermissionGroupParent(db, 'LESMIS User', LESMIS_ADMIN_ID);
};

exports.down = async function (db) {
  await updatePermissionGroupName(db, 'LESMIS Admin', 'Laos Schools Admin');
  await updatePermissionGroupName(db, 'LESMIS User', 'Laos Schools Super User');

  const ADMIN_ID = '59085f2dfc6a0715dae508e3';
  await updatePermissionGroupParent(db, 'Laos Schools Super User', ADMIN_ID);
};

exports._meta = {
  version: 1,
};
