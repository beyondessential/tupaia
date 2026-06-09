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
    update "dashboardGroup"
    set "dashboardReports" = array_remove("dashboardReports", 'UNFPA_Delivery_Services_Stock')
    where code in ('TO_Unfpa_Country', 'TO_Unfpa_District');
  `);
};

exports.down = function (db) {
  return db.runSql(`
    update "dashboardGroup"
    set "dashboardReports" = "dashboardReports" || '{ UNFPA_Delivery_Services_Stock }'
    where code in ('TO_Unfpa_Country', 'TO_Unfpa_District');
  `);
};

exports._meta = {
  version: 1,
};
