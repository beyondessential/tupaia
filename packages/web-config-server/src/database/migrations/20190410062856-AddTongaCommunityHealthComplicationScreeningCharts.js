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
        ['id', 'dataBuilder', 'viewJson', 'dataBuilderConfig', 'isDataRegional'],
        [
          'TO_CH_Complications_HBa1c',
          'latestMultiDataElement',
          `{
      "type": "chart",
      "name": "HBa1c Screening Results",
      "chartType": "pie"
    }`,
          `{
      "dataElementCodes": [ "CH244","CH245","CH246","CH247","CH248" ]
    }`,
          false,
        ],
        error => rejectOnError(resolve, reject, error),
      ),
    ),

    new Promise((resolve, reject) =>
      db.insert(
        'dashboardReport',
        ['id', 'dataBuilder', 'viewJson', 'dataBuilderConfig', 'isDataRegional'],
        [
          'TO_CH_Complications_eGFR',
          'latestMultiDataElement',
          `{
      "type": "chart",
      "name": "eGFR Screening Results",
      "chartType": "pie"
    }`,
          `{
      "dataElementCodes": [ "CH249","CH250","CH251","CH252" ]
    }`,
          false,
        ],
        error => rejectOnError(resolve, reject, error),
      ),
    ),

    new Promise((resolve, reject) =>
      db.insert(
        'dashboardReport',
        ['id', 'dataBuilder', 'viewJson', 'dataBuilderConfig', 'isDataRegional'],
        [
          'TO_CH_Complications_FCL',
          'latestMultiDataElement',
          `{
      "type": "chart",
      "name": "Fasting Cholesterol Levels",
      "chartType": "pie"
    }`,
          `{
      "dataElementCodes": [ "CH253","CH254" ]
    }`,
          false,
        ],
        error => rejectOnError(resolve, reject, error),
      ),
    ),

    new Promise((resolve, reject) =>
      db.insert(
        'dashboardReport',
        ['id', 'dataBuilder', 'viewJson', 'dataBuilderConfig', 'isDataRegional'],
        [
          'TO_CH_Complications_EyeCheck',
          'latestMultiDataElement',
          `{
      "type": "chart",
      "name": "Eye Check Results",
      "chartType": "pie"
    }`,
          `{
      "dataElementCodes": [ "CH255", "CH256" ]
    }`,
          false,
        ],
        error => rejectOnError(resolve, reject, error),
      ),
    ),

    new Promise((resolve, reject) =>
      db.insert(
        'dashboardReport',
        ['id', 'dataBuilder', 'viewJson', 'dataBuilderConfig', 'isDataRegional'],
        [
          'TO_CH_Complications_FootCheck',
          'latestMultiDataElement',
          `{
      "type": "chart",
      "name": "Foot Check Results",
      "chartType": "pie"
    }`,
          `{
      "dataElementCodes": [ "CH257", "CH258", "CH259" ]
    }`,
          false,
        ],
        error => rejectOnError(resolve, reject, error),
      ),
    ),

    new Promise((resolve, reject) =>
      db.runSql(
        `UPDATE "dashboardGroup"
      SET "dashboardReports" = "dashboardReports" || '{"TO_CH_Complications_HBa1c", "TO_CH_Complications_eGFR", "TO_CH_Complications_FCL", "TO_CH_Complications_EyeCheck", "TO_CH_Complications_FootCheck"}'
      WHERE code = 'Tonga_Community_Health_Country' OR code = 'Tonga_Community_Health_District';
      `,
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
