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

const SCALE_BOUNDS = {
  left: {
    max: 0,
    min: 0,
  },
  right: {
    max: 2,
    min: 2,
  },
};

exports.up = function (db) {
  return db.runSql(`
    update "mapOverlay"
    set "presentationOptions" = jsonb_set("presentationOptions",'{scaleBounds}','${JSON.stringify(
      SCALE_BOUNDS,
    )}')
    where id like 'Laos_Schools_%_Textbooks_Student_Ratio_%';
  `);
};

exports.down = function (db) {
  return db.runSql(`
    update "mapOverlay"
    set "presentationOptions" = "presentationOptions" - 'scaleBounds'
    where id like 'Laos_Schools_%_Textbooks_Student_Ratio_%';
  `);
};

exports._meta = {
  version: 1,
};
