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
          'TO_RH_Validation_MCH01',
          'singleColumnTable',
          `{
        "type": "chart",
        "name": "Number of High Risk Pregnancies",
        "chartType": "matrix",
        "placeholder": "/static/media/PEHSMatrixPlaceholder.png"
      }`,
          `{
        "dataElementGroupCode": "Number_High_Risk_Pregnancies",
        "dataElementColumnTitle" : "Number of Cases",
        "columnTitle": "Nature of High Risk"
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
          'TO_RH_Validation_MCH07',
          'singleColumnTable',
          `{
        "type": "chart",
        "name": "Health Promotion Sessions",
        "chartType": "matrix",
        "placeholder": "/static/media/PEHSMatrixPlaceholder.png"
      }`,
          `{
      "dataElementGroupCode": "Health_Promotion_Sessions",
        "dataElementColumnTitle" : "Number",
      "columnTitle": "Health Promotion Session"
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
          'TO_RH_Validation_IMMS01',
          'singleColumnTable',
          `{
        "type": "chart",
        "name": "School Immunization Services",
        "chartType": "matrix",
        "placeholder": "/static/media/PEHSMatrixPlaceholder.png"
      }`,
          `{
      "dataElementGroupCode": "School_Immunization_Services",
        "dataElementColumnTitle" : "Number",
      "columnTitle": "School Immunization Services"
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
          'TO_RH_Validation_IMMS03',
          'singleColumnTable',
          `{
        "type": "chart",
        "name": "Childhood Immunization Services",
        "chartType": "matrix",
        "placeholder": "/static/media/PEHSMatrixPlaceholder.png"
      }`,
          `{
      "dataElementGroupCode": "Childhood_Immunization_Services",
        "dataElementColumnTitle" : "Number",
      "columnTitle": "Childhood Immunization Services"
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
          'TO_RH_Validation_IMMS04',
          'singleColumnTable',
          `{
        "type": "chart",
        "name": "Maternal Immunization Services",
        "chartType": "matrix",
        "placeholder": "/static/media/PEHSMatrixPlaceholder.png"
      }`,
          `{
      "dataElementGroupCode": "Maternal_Immunization_Services",
        "dataElementColumnTitle" : "Number",
      "columnTitle": "Maternal Immunization Services"
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
          'TO_RH_Validation_IMMS05',
          'singleColumnTable',
          `{
        "type": "chart",
        "name": "Other Immunization Services",
        "chartType": "matrix",
        "placeholder": "/static/media/PEHSMatrixPlaceholder.png"
      }`,
          `{
      "dataElementGroupCode": "Other_Immunization_Services",
        "dataElementColumnTitle" : "Number",
      "columnTitle": "Other Immunization Services"
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
