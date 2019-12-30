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
          'TO_RH_Validation_FP',
          'tableFromDataElementGroups',
          `{
        "type": "chart",
        "name": "Family Planning Methods",
        "chartType": "matrix",
        "placeholder": "/static/media/PEHSMatrixPlaceholder.png",
        "dataElementColumnTitle" : "Method"
      }`,
          `{
      "columnDataElementGroupSet": "FP_Method_Counts",
      "rowDataElementGroupSet": "FP_Change_Counts",
      "stripFromColumnNames": "Family Planning Change Counts - ",
      "stripFromRowNames": "Family Planning Method Counts - ",
      "shouldShowTotalsRow": true
      }`,
          false,
        ],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.runSql(
        `UPDATE "dashboardGroup" SET "dashboardReports" = ? WHERE code = 'Tonga_Reproductive_Health_Facility'`,
        [['TO_RH_D07.1', 'TO_RH_Validation_FP']],
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
