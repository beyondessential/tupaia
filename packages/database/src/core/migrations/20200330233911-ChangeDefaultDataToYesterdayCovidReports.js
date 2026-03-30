'use strict';

var dbm;
var type;
var seed;

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
const REPORT_IDS = ['COVID_New_Cases_By_State', 'COVID_Daily_Cases_By_Type'];

const arrayToDbString = array => array.map(item => `'${item}'`).join(', ');

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
      "viewJson" = "viewJson" || '{"defaultTimePeriod": {
        "value": -1,
        "format": "days"
      }}'
    WHERE
      "id" IN (${arrayToDbString(REPORT_IDS)});
  `);
};

exports.down = function (db) {
  return db.runSql(`
    UPDATE
      "dashboardReport"
    SET
    "viewJson" = "viewJson" - 'defaultTimePeriod'
    WHERE
      "id" IN (${arrayToDbString(REPORT_IDS)});
  `);
};

exports._meta = {
  version: 1,
};
