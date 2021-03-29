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

exports.up = async function(db) {
  db.runSql(`
    UPDATE "mapOverlay"
    SET "presentationOptions" = "presentationOptions" || '{ "scaleType": "neutral" }'
    WHERE id like '%Total_Number_Of_People_1st_Dose_Covid_Vaccine'
    OR id like '%Total_Number_Of_People_2nd_Dose_Covid_Vaccine'
  `);

  return null;
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  "version": 1
};
