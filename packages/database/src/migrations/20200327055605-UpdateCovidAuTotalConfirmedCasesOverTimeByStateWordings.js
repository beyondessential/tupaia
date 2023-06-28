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
    UPDATE
      "dashboardReport"
    SET
      "viewJson" = jsonb_set("viewJson", '{name}', '"COVID-19 Total confirmed cases by State"')
    WHERE
      "id" = 'COVID_AU_Total_Cases_Each_State_Per_Day';
    
    UPDATE
      "dashboardReport"
    SET
      "viewJson" = jsonb_set("viewJson", '{description}', '"Total confirmed cases for each State"')
    WHERE
      "id" = 'COVID_AU_Total_Cases_Each_State_Per_Day';
  `);
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
