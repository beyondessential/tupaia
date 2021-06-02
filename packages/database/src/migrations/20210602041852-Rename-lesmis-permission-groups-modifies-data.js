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

const updateLESMISReportPermissionGroup = function (db, oldName, newName) {
  return db.runSql(`
  UPDATE "permission_group"
  SET "name" = '${newName}'
  WHERE "name" = '${oldName}'
  `);
};

exports.up = async function (db) {
  await updateLESMISReportPermissionGroup(db, 'Laos Schools Admin', 'LESMIS Admin');
  await updateLESMISReportPermissionGroup(db, 'Laos Schools Super User', 'LESMIS User');
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
