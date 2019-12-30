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
  const convertDisplayType = (from, to) => {
    return db.runSql(`
      UPDATE "mapOverlay"
      SET "displayType" = '${to}'
      WHERE "displayType" = '${from}'
    `);
  };

  return Promise.all([
    convertDisplayType('dot', 'color'),
    convertDisplayType('circle', 'radius'),
    convertDisplayType('circleHeatmap', 'spectrum'),
    convertDisplayType('', 'color'),
  ]);
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  version: 1,
};
