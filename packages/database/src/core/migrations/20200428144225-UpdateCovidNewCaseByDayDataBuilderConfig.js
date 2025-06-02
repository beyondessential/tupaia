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

// Update COVID_New_Cases_By_Day report to work with new 'sumPerPeriod' data builder
const NEW_COVID_NEW_CASES_BY_DAY_REPORT_DATA_BUILDER = {
  dataClasses: {
    value: {
      codes: ['dailysurvey003'],
    },
  },
};

// Old COVID_New_Cases_By_Day report dataBuilderConfig to revert back
const OLD_COVID_NEW_CASES_BY_DAY_REPORT_DATA_BUILDER = {
  dataSource: {
    codes: ['dailysurvey003'],
  },
};

exports.up = async function (db) {
  await db.runSql(`
    UPDATE "dashboardReport"
    SET "dataBuilderConfig" = '${JSON.stringify(NEW_COVID_NEW_CASES_BY_DAY_REPORT_DATA_BUILDER)}'
    WHERE id = 'COVID_New_Cases_By_Day';
  `);
};

exports.down = async function (db) {
  await db.runSql(`
    UPDATE "dashboardReport"
    SET "dataBuilderConfig" = '${JSON.stringify(OLD_COVID_NEW_CASES_BY_DAY_REPORT_DATA_BUILDER)}'
    WHERE id = 'COVID_New_Cases_By_Day';
  `);
};

exports._meta = {
  version: 1,
};
