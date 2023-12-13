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
  // Access requests are the only table with an FK to projects
  await db.runSql(`
    DELETE FROM access_request WHERE project_id IN (SELECT id FROM project WHERE code IN ('laos_eoc', 'covidau'))
  `);
  await db.runSql(`
    DELETE FROM project WHERE code IN ('laos_eoc', 'covidau')
  `);
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
