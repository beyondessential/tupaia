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
    update "dashboardReport" 
    set "viewJson" = jsonb_set("viewJson", '{name}', '"COVID-19 Daily New Case Numbers"')
    where id = 'COVID_Daily_Cases_By_Type';

    update "dashboardReport" 
    set "viewJson" = jsonb_set("viewJson", '{name}', '"COVID-19 New confirmed cases, daily count by State"')
    where id = 'COVID_New_Cases_By_State';
  `);
};

exports.down = function (db) {
  return db.runSql(`
    update "dashboardReport" 
    set "viewJson" = jsonb_set("viewJson", '{name}', '"COVID-19 New Case Numbers"')
    where id = 'COVID_Daily_Cases_By_Type';

    update "dashboardReport" 
    set "viewJson" = jsonb_set("viewJson", '{name}', '"COVID-19 New Confirmed Cases by State"')
    where id = 'COVID_New_Cases_By_State';
`);
};

exports._meta = {
  version: 1,
};
