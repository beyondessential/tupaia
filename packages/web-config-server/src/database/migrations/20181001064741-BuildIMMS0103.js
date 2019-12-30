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
          'TO_RH_Descriptive_IMMS01_03',
          'achievedVsTargetByFacility',
          `{
      "type": "chart",
      "name": "School Immunizations by Facility",
      "chartType": "bar",
      "xName": "Facility",
      "yName": "Number of Students",
      "periodGranularity": "month",
      "presentationOptions": {
        "achieved": {
          "color": "#279A63", "label": "Immunized so far", "stackId": "1"
        },
        "remaining": {
          "color": "#EE4230", "label": "Remain to be immunized", "stackId": "1"
        }
      }
    }`,
          `{
      "achievedDataElementGroupCode": "IMMS_School_Immunizations_Achieved",
      "targetDataElementGroupCode": "IMMS_School_Immunizations_Target"
    }`,
          false,
        ],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.runSql(
        `UPDATE "dashboardGroup" SET "dashboardReports" = "dashboardReports" || '{"TO_RH_Descriptive_IMMS01_03"}' WHERE code = 'Tonga_Reproductive_Health_Island_Group'`,
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.runSql(
        `UPDATE "dashboardGroup" SET "dashboardReports" = "dashboardReports" || '{"TO_RH_Descriptive_IMMS01_03"}' WHERE code = 'Tonga_Reproductive_Health_National'`,
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
