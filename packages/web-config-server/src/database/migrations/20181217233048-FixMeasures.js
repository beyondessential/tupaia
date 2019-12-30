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
    UPDATE "mapOverlay"
    SET "dataElementCode" = 'BCD82'
    WHERE "name" = 'Oxygen bottles';

    UPDATE "mapOverlay"
    SET "dataElementCode" = 'BCD83'
    WHERE "name" = 'Oxygen concentrators';

    UPDATE "mapOverlay"
    SET "dataElementCode" = 'SS24'
    WHERE "name" = 'Functional generator';

    UPDATE "mapOverlay"
    SET "dataElementCode" = 'SS190A'
    WHERE "name" = 'Diagnosis and management of TB';

    UPDATE "mapOverlay"
    SET "name" = 'Diagnosis and management of CVD'
    WHERE "id" = '143';

    UPDATE "mapOverlay"
    SET "dataElementCode" = 'SS103A'
    WHERE "id" = '143';

    DELETE FROM "mapOverlay"
    WHERE "dataElementCode" = 'SS14';

    DELETE FROM "mapOverlay"
    WHERE "dataElementCode" = 'SS15';

    DELETE FROM "mapOverlay"
    WHERE "dataElementCode" = 'BCD24e';
   
    UPDATE "mapOverlay"
    SET "name" = 'Water available at the facility'
    WHERE "id" = '85';

    UPDATE "mapOverlay"
    SET "name" = 'Drinking water available at the facility'
    WHERE "id" = '86';
  `);
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  version: 1,
};
