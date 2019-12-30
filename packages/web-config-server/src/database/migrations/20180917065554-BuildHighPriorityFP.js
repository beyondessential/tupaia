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
          'TO_RH_Descriptive_FP01_02',
          'monthlyPercentagesWithAnnualDenominator',
          `{
      "type": "chart",
      "name": "Contraceptive Prevalence Rate",
      "chartType": "line",
      "periodGranularity": "month"
    }`,
          `{
      "numeratorDataElementGroupCode": "FP_Change_Counts_8_Acceptors",
      "denominatorDataElementGroupCode": "Women_of_Child_Bearing_Age"
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
          'TO_RH_Descriptive_FP01_03',
          'achievedVsTargetByFacility',
          `{
      "type": "chart",
      "name": "New Acceptors vs. Births",
      "chartType": "bar",
      "periodGranularity": "one_month_at_a_time",
      "presentationOptions": {
        "achieved": {
          "color": "#279A63", "label": "New Acceptors", "stackId": "1"
        },
        "remaining": {
          "color": "#EE4230", "label": "Remaining New Births", "stackId": "1"
        }
      }
    }`,
          `{
      "achievedDataElementGroupCode": "FP_Change_Counts_1_New_Acceptors",
      "targetDataElementCode": "IMMS12"
    }`,
          false,
        ],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.runSql(
        `UPDATE "dashboardGroup" SET "dashboardReports" = "dashboardReports" || '{"TO_RH_Descriptive_FP01_02"}' WHERE code = 'Tonga_Reproductive_Health_Facility'`,
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.runSql(
        `UPDATE "dashboardGroup" SET "dashboardReports" = "dashboardReports" || '{"TO_RH_Descriptive_FP01_02", "TO_RH_Descriptive_FP01_03"}' WHERE code = 'Tonga_Reproductive_Health_Island_Group'`,
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.runSql(
        `UPDATE "dashboardGroup" SET "dashboardReports" = "dashboardReports" || '{"TO_RH_Descriptive_FP01_02", "TO_RH_Descriptive_FP01_03"}' WHERE code = 'Tonga_Reproductive_Health_National'`,
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
