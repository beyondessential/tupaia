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
const MAP_OVERLAY_ID = 'Laos_Schools_Dev_Partner_SchDP_UNIC';
const OLD_VALUE = 'SchDP_UNIC';
const NEW_VALUE = 'SchDP_UNICEF';

exports.up = function (db) {
  return db.runSql(`
    update "mapOverlay"
    set "dataElementCode" = '${NEW_VALUE}'
    where id = '${MAP_OVERLAY_ID}';
  `);
};

exports.down = function (db) {
  return db.runSql(`
    update "mapOverlay"
    set "dataElementCode" = '${OLD_VALUE}'
    where id = '${MAP_OVERLAY_ID}';
  `);
};

exports._meta = {
  version: 1,
};
