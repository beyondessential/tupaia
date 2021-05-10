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

const updateUserGroup = async function (db, table, from, to) {
  await db.runSql(`
  UPDATE "${table}"
  SET "userGroup" = '${to}'
  WHERE 'laos_schools' = ANY("projectCodes")
  AND "userGroup" = '${from}'
  `);
};

const renamePermissionGroup = async function (db, from, to) {
  await db.runSql(`
    UPDATE "permission_group"
    SET "name" = '${to}'
    WHERE "name" = '${from}'
  `);
};

const updateProject = async function (db, userGroup) {
  await db.runSql(`
    UPDATE "project"
    SET "user_groups" = '{"${userGroup}"}'
    WHERE "code" = 'laos_schools'
  `);
};

exports.up = async function (db) {
  await renamePermissionGroup(db, 'Laos Schools User', 'LESMIS Public');
  await updateUserGroup(db, 'mapOverlay', 'Public', 'LESMIS Public');
  await updateUserGroup(db, 'dashboardGroup', 'Public', 'LESMIS Public');
  await updateProject(db, 'LESMIS Public');
};

exports.down = async function (db) {
  await renamePermissionGroup(db, 'LESMIS Public', 'Laos Schools User');
  await updateUserGroup(db, 'mapOverlay', 'LESMIS Public', 'Public');
  await updateUserGroup(db, 'dashboardGroup', 'LESMIS Public', 'Public');
  await updateProject(db, 'Laos Schools User');
};

exports._meta = {
  version: 1,
};
