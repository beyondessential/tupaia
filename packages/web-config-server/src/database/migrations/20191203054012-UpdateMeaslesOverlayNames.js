'use strict';

var dbm;
var type;
var seed;

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function(db) {
  return db.runSql(`
    UPDATE "mapOverlay" SET name = 'Total Measles Cases (radius)'
      WHERE name = 'Total Measles Cases By Facility (radius)';
    UPDATE "mapOverlay" SET name = 'Total Measles Cases (heatmap)'
      WHERE name = 'Total Measles Cases By Facility (heatmap)';
  `);
};

exports.down = function(db) {
  return db.runSql(`
    UPDATE "mapOverlay" SET name = 'Total Measles Cases By Facility (radius)'
      WHERE name = 'Total Measles Cases (radius)';
    UPDATE "mapOverlay" SET name = 'Total Measles Cases By Facility (heatmap)'
      WHERE name = 'Total Measles Cases (heatmap)';
`);
};

exports._meta = {
  version: 1,
};
