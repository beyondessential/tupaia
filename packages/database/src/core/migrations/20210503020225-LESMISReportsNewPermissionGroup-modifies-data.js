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

const permissionGroupNameToId = async (db, name) => {
  const record = await db.runSql(`SELECT id FROM permission_group WHERE name = '${name}'`);
  return record.rows[0] && record.rows[0].id;
};

const updateLESMISReportPermissionGroup = async function (db, from, to) {
  const fromId = await permissionGroupNameToId(db, from);
  const toId = await permissionGroupNameToId(db, to);

  await db.runSql(`
  UPDATE "report"
  SET "permission_group_id" = '${toId}'
  WHERE "code" LIKE 'LESMIS%'
  AND "permission_group_id" = '${fromId}'
  `);
};

exports.up = async function (db) {
  await updateLESMISReportPermissionGroup(db, 'Public', 'LESMIS Public');
};

exports.down = async function (db) {
  await updateLESMISReportPermissionGroup(db, 'LESMIS Public', 'Public');
};

exports._meta = {
  version: 1,
};
