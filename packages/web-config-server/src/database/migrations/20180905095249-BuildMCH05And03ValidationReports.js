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
          'TO_RH_Validation_MCH05',
          'tableFromDataElementGroups',
          `{
        "type": "chart",
        "name": "Monthly Exclusive Breastfeeding",
        "chartType": "matrix",
        "placeholder": "/static/media/PEHSMatrixPlaceholder.png"
      }`,
          `{
      "columnDataElementGroupSet": "Breastfeeding_Mothers",
      "rowDataElementGroupSet": "Breastfeeding_Children",
      "stripFromColumnNames": "Breastfeeding - ",
      "stripFromRowNames": "Breastfeeding - ",
        "dataElementColumnTitle" : "Numbers"
      }`,
          false,
        ],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.insert(
        'dashboardReport',
        ['id', 'dataBuilder', 'viewJson', 'queryJson', 'isDataRegional'],
        [
          'TO_RH_Validation_MCH03',
          'tableFromDataElementGroups',
          `{
        "type": "chart",
        "name": "Service Groups",
        "chartType": "matrix",
        "placeholder": "/static/media/PEHSMatrixPlaceholder.png"
      }`,
          `{
      "columnDataElementGroupSet": "Service_Groups",
      "rowDataElementGroupSet": "Monthly_Home_Visits",
      "stripFromColumnNames": "Service Group  - ",
      "stripFromRowNames": "Monthly Home Visits - ",
        "dataElementColumnTitle" : "Service Group"
      }`,
          false,
        ],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.runSql(
        `UPDATE "dashboardGroup" SET "dashboardReports" = ? WHERE code = 'Tonga_Reproductive_Health_Facility'`,
        [
          [
            'TO_RH_D07.1',
            'TO_RH_Validation_FP',
            'TO_RH_Validation_MCH01',
            'TO_RH_Validation_MCH03',
            'TO_RH_Validation_MCH05',
            'TO_RH_Validation_MCH07',
            'TO_RH_Validation_IMMS01',
            'TO_RH_Validation_IMMS03',
            'TO_RH_Validation_IMMS04',
            'TO_RH_Validation_IMMS05',
          ],
        ],
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
