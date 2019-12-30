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

exports.up = function(db, callback) {
  const rejectOnError = (resolve, reject, error) => {
    if (error) {
      reject(error);
    } else {
      resolve();
    }
  };
  Promise.all([
    new Promise((resolve, reject) =>
      db.insert(
        'dashboardReport',
        ['id', 'dataBuilder', 'viewJson', 'queryJson', 'isDataRegional'],
        [
          'TO_RH_Validation_MCH01_Total',
          'latestMultiDataElement',
          `{
      "type": "view",
      "name": "Total Number of High Risk Pregnancies",
      "viewType": "singleValue"
    }`,
          `{
      "apiRoute": "analytics",
      "dataElementCodes": [ "MCH2" ]
    }`,
          false,
        ],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.runSql(
        `UPDATE "dashboardGroup" SET "dashboardReports" = "dashboardReports" || '{"TO_RH_Validation_MCH01_Total"}' WHERE code = 'Tonga_Reproductive_Health_Facility'`,
        error => rejectOnError(resolve, reject, error),
      ),
    ),
  ]).then(() => callback());
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  version: 1,
};
