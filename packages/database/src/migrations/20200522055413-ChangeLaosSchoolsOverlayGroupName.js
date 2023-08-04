'use strict';

var dbm;
var type;
var seed;

const OLD_MAP_OVERLAY_GROUP = 'Number of Students';

const NEW_MAP_OVERLAY_GROUP = 'Student Numbers';

exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function (db) {
  return db.runSql(`
      update "mapOverlay"
      set "groupName" = '${NEW_MAP_OVERLAY_GROUP}'
      where "groupName" ='${OLD_MAP_OVERLAY_GROUP}';
    `);
};

exports.down = function (db) {
  return db.runSql(`
      update "mapOverlay"
      set "groupName" = '${OLD_MAP_OVERLAY_GROUP}'
      where "groupName" ='${NEW_MAP_OVERLAY_GROUP}';
    `);
};

exports._meta = {
  version: 1,
};
