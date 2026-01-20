'use strict';

var dbm;
var type;
var seed;

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

const NEW_PEHS_SURVEY_CODES = [
  'PEHS_SE',
  'PEHS_GCS',
  'PEHS_MFP',
  'PEHS_MHR',
  'PEHS_CD',
  'PEHS_GBV',
  'PEHS_NCD',
  'PEHS_EAS',
  'PEHS_DS',
  'PEHS_OHS',
];

const CONFIGS_BY_REPORT_ID = {
  31: {
    old: {
      preConfig: {
        name: 'Download Disaster Preparation Survey Response',
        surveyCodes: ['DR_PRE', 'DP_LEGACY'],
        dataElementGroupCode: 'DR_PRESurveyDate',
      },
      postConfig: {
        name: 'Download Post Disaster Survey Response',
        surveyCodes: ['DR_POST_48hours', 'DR_POST_2weeks'],
        dataElementGroupCode: 'DR_POSTSurveyDate',
      },
    },
    new: {
      preConfig: {
        name: 'Download Disaster Preparation Survey Response',
        surveyCodes: ['DR_PRE', 'DP_LEGACY'],
        dataElementGroupCode: 'DR_PRESurveyDate',
      },
      postConfig: {
        name: 'Download Post Disaster Survey Response',
        surveyCodes: ['DR_POST_48hours', 'DR_POST_2weeks'],
        dataElementGroupCode: 'DR_POSTSurveyDate',
      },
      surveys: [
        { code: 'DR_PRE' },
        { code: 'DP_LEGACY' },
        { code: 'DR_POST_48hours' },
        { code: 'DR_POST_2weeks' },
      ],
    },
  },
  51: {
    old: {
      surveyCodes: ['PEHS'],
      dataElementGroupCode: 'PEHSSurveyDate',
    },
    new: {
      surveyCodes: NEW_PEHS_SURVEY_CODES,
      dataElementGroupCode: 'PEHSSurveyDate',
    },
  },
  52: {
    old: {
      surveyCodes: ['PEHS'],
      dataElementGroupCode: 'PEHSSurveyDate',
    },
    new: {
      surveyCodes: NEW_PEHS_SURVEY_CODES,
      dataElementGroupCode: 'PEHSSurveyDate',
    },
  },
};

const updateReportConfig = async (db, reportId, config) =>
  db.runSql(`
    UPDATE "dashboardReport"
    SET "dataBuilderConfig" = '${JSON.stringify(config)}'
    WHERE id = '${reportId}';
`);

exports.up = async function (db) {
  await Promise.all(
    Object.entries(CONFIGS_BY_REPORT_ID).map(([reportId, { new: config }]) =>
      updateReportConfig(db, reportId, config),
    ),
  );
};

exports.down = async function (db) {
  await Promise.all(
    Object.entries(CONFIGS_BY_REPORT_ID).map(([reportId, { old: config }]) =>
      updateReportConfig(db, reportId, config),
    ),
  );
};

exports._meta = {
  version: 1,
};
