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

const updateDashboardYLabel = async (db, yLabel) =>
  db.runSql(`
  UPDATE dashboard_item
  SET config = config || '{"yName": "${yLabel}" }'
  WHERE code LIKE 'LESMIS_percent_children_over_age%'
`);

exports.up = function (db) {
  return updateDashboardYLabel(db, '% Children Over Age for Grade');
};

exports.down = function (db) {
  return updateDashboardYLabel(db, '%');
};

exports._meta = {
  version: 1,
};
