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
          'TO_RH_Descriptive_IMMS_Coverage',
          'percentagesByGroup',
          `{
      "type": "chart",
      "name": "Annual Childhood Immunization Coverage by Type",
      "chartType": "bar",
      "xName": "Immunization Type",
      "yName": "% of Target Population Immunized",
      "periodGranularity": "year",
      "valueType": "percentage"
    }`,
          `{
      "groups": [
        {
          "name": "Hep B Birth Dose",
          "numeratorDataElementCode": "IMMS43",
          "denominatorDataElementCode": "IMMS42"
        },
        {
          "name": "BCG Infant",
          "numeratorDataElementCode": "IMMS41",
          "denominatorDataElementCode": "IMMS40"
        },
        {
          "name": "DPT/HepB/HIB Dose 1",
          "numeratorDataElementCode": "IMMS45",
          "denominatorDataElementCode": "IMMS44"
        },
        {
          "name": "DPT/HepB/HIB Dose 2",
          "numeratorDataElementCode": "IMMS47",
          "denominatorDataElementCode": "IMMS46"
        },
        {
          "name": "DPT/HepB/HIB Dose 3",
          "numeratorDataElementCode": "IMMS49",
          "denominatorDataElementCode": "IMMS48"
        },
        {
          "name": "OPV Dose 1",
          "numeratorDataElementCode": "IMMS53",
          "denominatorDataElementCode": "IMMS52"
        },
        {
          "name": "OPV Dose 2",
          "numeratorDataElementCode": "IMMS55",
          "denominatorDataElementCode": "IMMS54"
        },
        {
          "name": "OPV Dose 3",
          "numeratorDataElementCode": "IMMS57",
          "denominatorDataElementCode": "IMMS56"
        },
        {
          "name": "IPV Dose 1",
          "numeratorDataElementCode": "IMMS51",
          "denominatorDataElementCode": "IMMS50"
        },
        {
          "name": "MR Dose 1",
          "numeratorDataElementCode": "IMMS61",
          "denominatorDataElementCode": "IMMS60"
        },
        {
          "name": "MR Dose 2",
          "numeratorDataElementCode": "IMMS63",
          "denominatorDataElementCode": "IMMS62"
        },
        {
          "name": "DPT Dose 4",
          "numeratorDataElementCode": "IMMS59",
          "denominatorDataElementCode": "IMMS58"
        },
        {
          "numeratorDataElementCode": "IMMS79",
          "denominatorDataElementCode": "IMMS78",
          "name": "DPT5 for School Entry Students 5-6 years old"
        },
        {
          "numeratorDataElementCode": "IMMS79_2",
          "denominatorDataElementCode": "IMMS79_1",
          "name": "Td for School Entry Students >7 years old"
        },
        {
          "numeratorDataElementCode": "IMMS81",
          "denominatorDataElementCode": "IMMS80",
          "name": "Td for High School Leavers"
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
        `UPDATE "dashboardGroup" SET "dashboardReports" = "dashboardReports" || '{"TO_RH_Descriptive_IMMS_Coverage"}' WHERE code = 'Tonga_Reproductive_Health_Facility'`,
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.runSql(
        `UPDATE "dashboardGroup" SET "dashboardReports" = "dashboardReports" || '{"TO_RH_Descriptive_IMMS_Coverage"}' WHERE code = 'Tonga_Reproductive_Health_Island_Group'`,
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.runSql(
        `UPDATE "dashboardGroup" SET "dashboardReports" = "dashboardReports" || '{"TO_RH_Descriptive_IMMS_Coverage"}' WHERE code = 'Tonga_Reproductive_Health_National'`,
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
