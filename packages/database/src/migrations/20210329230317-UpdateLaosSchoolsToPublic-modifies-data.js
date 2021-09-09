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

const updateUserGroup = async function (table, from, to, db) {
  await db.runSql(`
  UPDATE "${table}"
  SET "userGroup" = '${to}'
  WHERE 'laos_schools' = ANY("projectCodes")
  AND "userGroup" = '${from}'
  `);
};

exports.up = async function (db) {
  await updateUserGroup('mapOverlay', 'Laos Schools User', 'Public', db);
  await updateUserGroup('dashboardGroup', 'Laos Schools User', 'Public', db);
};

exports.down = async function (db) {
  await updateUserGroup('mapOverlay', 'Public', 'Laos Schools User', db);
  await updateUserGroup('dashboardGroup', 'Public', 'Laos Schools User', db);
};

exports._meta = {
  version: 1,
};
