'use strict';

var dbm;
var type;
var seed;

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
const OLD_REPORT_ID = 'COVID_New_Cases_By_Day_State';
const NEW_REPORT_ID = 'COVID_New_Cases_By_Day';

exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function (db) {
  return db.runSql(`
    update "dashboardReport"
    set id = '${NEW_REPORT_ID}'
    where id = '${OLD_REPORT_ID}';

    update "dashboardGroup"
    set "dashboardReports" = array_remove("dashboardReports", '${OLD_REPORT_ID}')
    where code in ('AU_Covid_Country', 'AU_Covid_Province');

    update "dashboardGroup"
    set "dashboardReports" = "dashboardReports" || '{ ${NEW_REPORT_ID} }'
    where code in ('AU_Covid_Country', 'AU_Covid_Province') 
  `);
};

exports.down = function (db) {
  return db.runSql(`
    update "dashboardReport"
    set id = '${OLD_REPORT_ID}'
    where id = '${NEW_REPORT_ID}';

    update "dashboardGroup"
    set "dashboardReports" = array_remove("dashboardReports", '${NEW_REPORT_ID}')
    where code in ('AU_Covid_Country', 'AU_Covid_Province');

    update "dashboardGroup"
    set "dashboardReports" = "dashboardReports" || '{ ${OLD_REPORT_ID} }'
    where code in ('AU_Covid_Country', 'AU_Covid_Province') 
  `);
};

exports._meta = {
  version: 1,
};
