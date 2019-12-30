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

  const createJSONRange = (start, end) => {
    const range = [];
    for (var i = start; i < end + 1; i++) {
      range.push(`CH${i}`);
    }

    return JSON.stringify(range);
  };

  Promise.all([
    new Promise((resolve, reject) =>
      db.insert(
        'dashboardReport',
        ['id', 'dataBuilder', 'dataBuilderConfig', 'viewJson', 'isDataRegional'],
        [
          'TO_CH_Validation_CH10',
          'singleColumnTable',
          `{
        "dataElementCodes": ${createJSONRange(405, 449)},
        "columnTitle": "Count"
      }`,
          `{
        "type": "chart",
        "name": "Daily National Diabetes Centre Clinic",
        "chartType": "matrix",
        "placeholder": "/static/media/PEHSMatrixPlaceholder.png",
        "periodGranularity": "day"
      }`,
          false,
        ],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.insert(
        'dashboardReport',
        ['id', 'dataBuilder', 'dataBuilderConfig', 'viewJson', 'isDataRegional'],
        [
          'TO_CH_Validation_CH2a',
          'singleColumnTable',
          `{
        "dataElementCodes": ${createJSONRange(243, 259)},
        "columnTitle": "Count"
      }`,
          `{
        "type": "chart",
        "name": "Annual DM II/HTN Complications Screening",
        "chartType": "matrix",
        "placeholder": "/static/media/PEHSMatrixPlaceholder.png",
        "periodGranularity": "one_year_at_a_time"
      }`,
          false,
        ],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.insert(
        'dashboardReport',
        ['id', 'dataBuilder', 'dataBuilderConfig', 'viewJson', 'isDataRegional'],
        [
          'TO_CH_Validation_CH3',
          'singleColumnTable',
          `{
        "dataElementCodes": ${createJSONRange(267, 284)},
        "columnTitle": "Count"
      }`,
          `{
        "type": "chart",
        "name": "Annual DM II/HTN Medication Data",
        "chartType": "matrix",
        "placeholder": "/static/media/PEHSMatrixPlaceholder.png",
        "periodGranularity": "one_year_at_a_time"
      }`,
          false,
        ],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    // new Promise((resolve, reject) => db.insert('dashboardReport', ['id', 'dataBuilder', 'dataBuilderConfig', 'viewJson', 'isDataRegional'], [
    //   'TO_CH_Validation_CH4',
    //   'singleColumnTable',
    //   `{
    //     "dataElementCodes": ${createJSONRange(286, 297)},
    //     "columnTitle": "Count"
    //   }`,
    //   `{
    //     "type": "chart",
    //     "name": "Annual DM II/HTN Patient Risk Factor Data",
    //     "chartType": "matrix",
    //     "placeholder": "/static/media/PEHSMatrixPlaceholder.png",
    //     "periodGranularity": "one_year_at_a_time"
    //   }`,
    //   false,
    // ], (error) => rejectOnError(resolve, reject, error))),
    new Promise((resolve, reject) =>
      db.insert(
        'dashboardReport',
        ['id', 'dataBuilder', 'dataBuilderConfig', 'viewJson', 'isDataRegional'],
        [
          'TO_CH_Validation_CH6',
          'singleColumnTable',
          `{
        "dataElementCodes": ${createJSONRange(324, 334)},
        "columnTitle": "Count"
      }`,
          `{
        "type": "chart",
        "name": "Weekly Clinic Dressings and Other Services",
        "chartType": "matrix",
        "placeholder": "/static/media/PEHSMatrixPlaceholder.png",
        "periodGranularity": "one_week_at_a_time"
      }`,
          false,
        ],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.insert(
        'dashboardReport',
        ['id', 'dataBuilder', 'dataBuilderConfig', 'viewJson', 'isDataRegional'],
        [
          'TO_CH_Validation_CH7',
          'singleColumnTable',
          `{
        "dataElementCodes": ${createJSONRange(336, 347)},
        "columnTitle": "Count"
      }`,
          `{
        "type": "chart",
        "name": "Weekly Outreach Program",
        "chartType": "matrix",
        "placeholder": "/static/media/PEHSMatrixPlaceholder.png",
        "periodGranularity": "one_week_at_a_time"
      }`,
          false,
        ],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.insert(
        'dashboardReport',
        ['id', 'dataBuilder', 'dataBuilderConfig', 'viewJson', 'isDataRegional'],
        [
          'TO_CH_Validation_CH8',
          'singleColumnTable',
          `{
        "dataElementCodes": ${createJSONRange(349, 364)},
        "columnTitle": "Count"
      }`,
          `{
        "type": "chart",
        "name": "Weekly Number of Consultations",
        "chartType": "matrix",
        "placeholder": "/static/media/PEHSMatrixPlaceholder.png",
        "periodGranularity": "one_week_at_a_time"
      }`,
          false,
        ],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.insert(
        'dashboardReport',
        ['id', 'dataBuilder', 'dataBuilderConfig', 'viewJson', 'isDataRegional'],
        [
          'TO_CH_Validation_CH12',
          'singleColumnTable',
          `{
        "dataElementCodes": ${createJSONRange(606, 619)},
        "columnTitle": "Count"
      }`,
          `{
        "type": "chart",
        "name": "Weekly - OGTT and GDM",
        "chartType": "matrix",
        "placeholder": "/static/media/PEHSMatrixPlaceholder.png",
        "periodGranularity": "one_week_at_a_time"
      }`,
          false,
        ],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.insert(
        'dashboardReport',
        ['id', 'dataBuilder', 'dataBuilderConfig', 'viewJson', 'isDataRegional'],
        [
          'TO_CH_Validation_CH5',
          'tableFromDataElementGroups',
          `{
      "columnDataElementGroupSets": ["CH5_Columns"],
      "rowDataElementGroupSets": ["CH5_Rows"],
      "stripFromColumnNames": "CH5 ",
      "stripFromRowNames": "CH5 ",
      "shouldShowTotalsRow": true
      }`,
          `{
        "type": "chart",
        "name": "Weekly DM II/HTN Clinics",
        "chartType": "matrix",
        "placeholder": "/static/media/PEHSMatrixPlaceholder.png",
        "periodGranularity": "one_week_at_a_time",
        "dataElementColumnTitle" : "Clinics"
      }`,
          false,
        ],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.insert(
        'dashboardReport',
        ['id', 'dataBuilder', 'dataBuilderConfig', 'viewJson', 'isDataRegional'],
        [
          'TO_CH_Validation_CH9',
          'tableFromDataElementGroups',
          `{
      "columnDataElementGroupSets": ["CH9_Columns"],
      "rowDataElementGroupSets": ["CH9_Rows"],
      "stripFromColumnNames": "CH9 ",
      "stripFromRowNames": "CH9 ",
      "shouldShowTotalsRow": true
      }`,
          `{
        "type": "chart",
        "name": "Weekly Illness and Syndromic Surveillance",
        "chartType": "matrix",
        "placeholder": "/static/media/PEHSMatrixPlaceholder.png",
        "periodGranularity": "one_week_at_a_time",
        "dataElementColumnTitle" : "Age"
      }`,
          false,
        ],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    // new Promise((resolve, reject) => db.insert('dashboardReport', ['id', 'dataBuilder', 'dataBuilderConfig', 'viewJson', 'isDataRegional'], [
    //   'TO_CH_Validation_CH11',
    //   'tableFromDataElementGroups',
    //   `{
    //   "columnDataElementGroupSets": ["CH11_Columns"],
    //   "rowDataElementGroupSets": ["CH11_Rows"],
    //   "stripFromColumnNames": "CH11 ",
    //   "stripFromRowNames": "CH11 ",
    //   "shouldShowTotalsRow": true
    //   }`,
    //   `{
    //     "type": "chart",
    //     "name": "Monthly NCD Risk Factors - Scheduled Population Screening",
    //     "chartType": "matrix",
    //     "placeholder": "/static/media/PEHSMatrixPlaceholder.png",
    //     "periodGranularity": "one_month_at_a_time",
    //     "dataElementColumnTitle" : "Patient"
    //   }`,
    //   false
    // ], (error) => rejectOnError(resolve, reject, error))),
    new Promise((resolve, reject) =>
      db.insert(
        'dashboardReport',
        ['id', 'dataBuilder', 'dataBuilderConfig', 'viewJson', 'isDataRegional'],
        [
          'TO_CH_Validation_CH1',
          'tableFromDataElementGroups',
          `{
      "columnDataElementGroupSets": ["CH1_Columns"],
      "rowDataElementGroupSets": ["CH1_Rows"],
      "stripFromColumnNames": "CH1 ",
      "stripFromRowNames": "CH1 ",
      "shouldShowTotalsRow": true
      }`,
          `{
        "type": "chart",
        "name": "Annual NCD Screening and Diagnosis by Age & Gender",
        "chartType": "matrix",
        "placeholder": "/static/media/PEHSMatrixPlaceholder.png",
        "periodGranularity": "one_year_at_a_time",
        "dataElementColumnTitle" : "Patient"
      }`,
          false,
        ],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.insert(
        'dashboardReport',
        ['id', 'dataBuilder', 'dataBuilderConfig', 'viewJson', 'isDataRegional'],
        [
          'TO_CH_Validation_CH1b',
          'singleColumnTable',
          `{
        "dataElementCodes": ["CH2", "CH3", "CH10", "CH11", "CH12", "CH13", "CH14", "CH239", "CH240", "CH241"],
        "columnTitle": "Count"
      }`,
          `{
        "type": "chart",
        "name": "General Annual NCD Screening and Diagnosis",
        "chartType": "matrix",
        "placeholder": "/static/media/PEHSMatrixPlaceholder.png",
        "periodGranularity": "one_year_at_a_time"
      }`,
          false,
        ],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.insert(
        'dashboardReport',
        ['id', 'dataBuilder', 'dataBuilderConfig', 'viewJson', 'isDataRegional'],
        [
          'TO_CH_Validation_CH2b',
          'singleColumnTable',
          `{
        "dataElementCodes": ["CH261", "CH262", "CH263", "CH264", "CH265"],
        "columnTitle": "Count"
      }`,
          `{
        "type": "chart",
        "name": "Monthly DM II/HTN Complications Screening Encounters",
        "chartType": "matrix",
        "placeholder": "/static/media/PEHSMatrixPlaceholder.png",
        "periodGranularity": "one_month_at_a_time"
      }`,
          false,
        ],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.runSql(
        `UPDATE "dashboardGroup" SET "dashboardReports" = '{"TO_CH_Validation_CH1", "TO_CH_Validation_CH1b", "TO_CH_Validation_CH2a", "TO_CH_Validation_CH2b", "TO_CH_Validation_CH3", "TO_CH_Validation_CH5", "TO_CH_Validation_CH6", "TO_CH_Validation_CH7", "TO_CH_Validation_CH8", "TO_CH_Validation_CH9", "TO_CH_Validation_CH10", "TO_CH_Validation_CH12"}' WHERE name = 'Community Health Validation'`,
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
