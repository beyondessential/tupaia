'use strict';

var dbm;
var type;
var seed;

const LEGACY_REPORTS = [
  {
    code: 'Disaster_Response_Comparisons',
    oldDataBuilderConfig: {
      dataElementPairs: [['DP_NEW001', 'DP9']],
    },
    newDataBuilderConfig: {
      dataElementPairs: [['DP_NEW001', 'DP9']],
      leftColumnHeader: 'Normal',
      rightColumnHeader: 'Current',
      dataPairNames: ['Inpatient beds'],
    },
  },
  {
    code: 'Disaster_Response_Comparisons',
    oldDataBuilderConfig: {
      dataElementPairs: [['DP_NEW001', 'DP9']],
    },
    newDataBuilderConfig: {
      dataElementPairs: [['DP_NEW001', 'DP9']],
      leftColumnHeader: 'Normal',
      rightColumnHeader: 'Current',
      dataPairNames: ['Inpatient beds'],
    },
  },
  {
    code: '31',
    oldDataBuilderConfig: {
      surveys: [
        {
          code: 'DR_PRE',
        },
        {
          code: 'DP_LEGACY',
        },
        {
          code: 'DR_POST_48hours',
        },
        {
          code: 'DR_POST_2weeks',
        },
      ],
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
    newDataBuilderConfig: {
      name: 'Date Last Assessed', // new
      surveys: [
        {
          code: 'DR_PRE',
        },
        {
          code: 'DP_LEGACY',
        },
        {
          code: 'DR_POST_48hours',
        },
        {
          code: 'DR_POST_2weeks',
        },
      ],
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
  },
  {
    code: '51',
    oldDataBuilderConfig: {
      surveyCodes: [
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
      ],
      dataElementGroupCode: 'PEHSSurveyDate',
    },
    newDataBuilderConfig: {
      name: 'Date Last Assessed',
      surveyCodes: [
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
      ],
      dataElementGroupCode: 'PEHSSurveyDate',
    },
  },
  {
    code: '52',
    oldDataBuilderConfig: {
      surveyCodes: [
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
      ],
      dataElementGroupCode: 'PEHSSurveyDate',
    },
    newDataBuilderConfig: {
      name: 'Date Last Assessed',
      surveyCodes: [
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
      ],
      dataElementGroupCode: 'PEHSSurveyDate',
    },
  },
];

const LEGACY_DASHBOARD_ITEMS = [
  {
    code: '5',
    oldConfig: {
      name: 'Date Last Assessed',
      type: 'view',
      viewType: 'multiSingleValue',
    },
    newConfig: {
      name: 'Date Last Assessed',
      type: 'view',
      viewType: 'singleDate',
    },
  },
];

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = async function (db) {
  await Promise.all(
    LEGACY_REPORTS.map(async report =>
      db.runSql(`
        UPDATE legacy_report
        SET data_builder_config = '${JSON.stringify(report.newDataBuilderConfig)}'
        WHERE code = '${report.code}'
      `),
    ),
  );

  await Promise.all(
    LEGACY_DASHBOARD_ITEMS.map(async item =>
      db.runSql(`
        UPDATE dashboard_item
        SET config = '${JSON.stringify(item.newConfig)}'
        WHERE code = '${item.code}'
      `),
    ),
  );
};

exports.down = async function (db) {
  await Promise.all(
    LEGACY_REPORTS.map(async report =>
      db.runSql(`
        UPDATE legacy_report
        SET data_builder_config = '${JSON.stringify(report.oldDataBuilderConfig)}'
        WHERE code = '${report.code}'
      `),
    ),
  );

  await Promise.all(
    LEGACY_DASHBOARD_ITEMS.map(async item =>
      db.runSql(`
        UPDATE dashboard_item
        SET config = '${JSON.stringify(item.oldConfig)}'
        WHERE code = '${item.code}'
      `),
    ),
  );
};

exports._meta = {
  version: 1,
};
