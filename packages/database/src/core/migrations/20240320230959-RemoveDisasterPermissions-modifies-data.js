'use strict';

var dbm;
var type;
var seed;

const DISASTER_PERMISSION_GROUPS = ['Disaster Response Admin', 'Disaster Response'];

const convertArrayToString = array => {
  return array.map(item => `'${item}'`).join(',');
};

// Get all permission groups that are related to disasters
const getPermissionGroups = async db => {
  const { rows: permissionGroups } = await db.runSql(`
    SELECT * from permission_group
    where name IN (${convertArrayToString(DISASTER_PERMISSION_GROUPS)});
  `);
  return permissionGroups;
};

// Remove user entity permissions that are related to disasters
const removeUserEntityPermissions = async (db, permissionGroups) => {
  await db.runSql(`
    DELETE from user_entity_permission
    where permission_group_id IN (${convertArrayToString(permissionGroups.map(p => p.id))});
  `);
};

// Remove permission groups that are related to disasters
const removePermissionGroups = async (db, permissionGroups) => {
  await db.runSql(`
    DELETE from permission_group
    where id IN (${convertArrayToString(permissionGroups.map(p => p.id))});
  `);
};

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
  const permissionGroups = await getPermissionGroups(db);
  if (permissionGroups.length === 0) return;

  await removeUserEntityPermissions(db, permissionGroups);
  await removePermissionGroups(db, permissionGroups);
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
