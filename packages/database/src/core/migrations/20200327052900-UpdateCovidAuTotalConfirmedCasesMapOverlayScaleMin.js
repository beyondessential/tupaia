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

exports.up = function (db) {
  return db.runSql(`
    UPDATE "mapOverlay"
    SET "presentationOptions" = "presentationOptions" || '{"scaleMin": 0}'
    WHERE "id" = 'COVID_AU_State_Total_Number_Confirmed_Cases';
  `);
};

exports.down = function (db) {
  return db.runSql(`
    UPDATE "mapOverlay"
    SET "presentationOptions" = "presentationOptions" - 'scaleMin'
    WHERE "id" = 'COVID_AU_State_Total_Number_Confirmed_Cases';
  `);
};

exports._meta = {
  version: 1,
};
