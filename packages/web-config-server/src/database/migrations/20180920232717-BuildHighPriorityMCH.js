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
      db.runSql(
        `UPDATE "dashboardReport" SET "dataBuilder" = 'monthlyPercentages', "dataBuilderConfig" = "dataBuilderConfig" || '{"isDenominatorAnnual":true}' WHERE "dataBuilder" = 'monthlyPercentagesWithAnnualDenominator'`,
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.insert(
        'dashboardReport',
        ['id', 'dataBuilder', 'viewJson', 'dataBuilderConfig', 'isDataRegional'],
        [
          'TO_RH_Descriptive_MCH0304_03',
          'countValuesByDataElementGroup',
          `{
      "type": "chart",
      "name": "First Visit to New Babies",
      "chartType": "pie",
      "periodGranularity": "one_month_at_a_time"
    }`,
          `{
      "dataElementGroupSet": "First_Visit_to_New_Babies"
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
          'TO_RH_Descriptive_MCH05_01',
          'monthlyPercentages',
          `{
      "type": "chart",
      "name": "% Exclusively Breastfeeding",
      "chartType": "bar",
      "xName": "Month",
      "yName": "% Exclusively Breastfeeding",
      "periodGranularity": "month",
      "valueType": "percentage",
      "presentationOptions": {
        "4 Months": {
          "color": "#279A63", "label": "4 Months"
        },
        "6 Months": {
          "color": "#EE9A30", "label": "6 Months"
        }
      }
    }`,
          `{
      "series": [
        {
          "numeratorDataElementGroupCode": "Breastfeeding_Number_EBF_4_Months",
          "denominatorDataElementGroupCode": "Breastfeeding_Number_Interviewed_4_Months",
          "key": "4 Months"
        },
        {
          "numeratorDataElementGroupCode": "Breastfeeding_Number_EBF_6_Months",
          "denominatorDataElementGroupCode": "Breastfeeding_Number_Interviewed_6_Months",
          "key": "6 Months"
        }
      ]
    }`,
          false,
        ],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.runSql(
        `UPDATE "dashboardGroup" SET "dashboardReports" = "dashboardReports" || '{"TO_RH_Descriptive_MCH05_01", "TO_RH_Descriptive_MCH0304_03"}' WHERE code = 'Tonga_Reproductive_Health_Facility'`,
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.runSql(
        `UPDATE "dashboardGroup" SET "dashboardReports" = "dashboardReports" || '{"TO_RH_Descriptive_MCH05_01", "TO_RH_Descriptive_MCH0304_03"}' WHERE code = 'Tonga_Reproductive_Health_Island_Group'`,
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.runSql(
        `UPDATE "dashboardGroup" SET "dashboardReports" = "dashboardReports" || '{"TO_RH_Descriptive_MCH05_01", "TO_RH_Descriptive_MCH0304_03"}' WHERE code = 'Tonga_Reproductive_Health_National'`,
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
