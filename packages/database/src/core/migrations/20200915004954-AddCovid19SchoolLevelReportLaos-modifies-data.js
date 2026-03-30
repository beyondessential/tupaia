'use strict';

import { insertObject } from '../utilities/migration';

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

const DASHBOARD_GROUP_CODE = 'LA_Laos_Schools_School_Laos_Schools_User';

const REPORT_ID = 'Laos_Schools_Covid_19_School_Table';

const DATA_BUILDER_CONFIG = {
  rows: [
    'School used as quarantine centre',
    'COVID-19 posters and materials received',
    'School implementing MoES safe school protocols/guidelines',
    'Thermometer(s) received',
  ],
  cells: [
    [
      {
        key: 'School_Is_Quarantine_Centre',
        operator: 'CHECK_CONDITION',
        condition: { operator: 'regex', value: 'Yes' },
        dataElement: 'SchCVD002',
      },
      'SchCVD002',
    ],
    ['SchCVD006'],
    [
      {
        key: 'School_implementing_MoES_safe_school_protocols',
        operator: 'CHECK_CONDITION',
        condition: { operator: 'regex', value: 'Yes' },
        dataElement: 'SchCVD027',
      },
      {
        key: 'School_implementing_MoES_safe_school_protocols_detail',
        operator: 'GROUP',
        groups: {
          'Yes, fully': { value: 'Yes, fully', operator: 'regex' },
          'Yes, partially': { value: 'Yes, partially', operator: 'regex' },
          No: { value: 'No', operator: 'regex' },
        },
        defaultValue: 'Error while building answer',
        dataElement: 'SchCVD027',
      },
    ],
    ['SchCVD024'],
  ],
  columns: ['Main', 'Extra'],
  entityAggregation: {
    dataSourceEntityType: 'school',
  },
};

const VIEW_JSON = {
  name: 'COVID-19',
  type: 'matrix',
  placeholder: '/static/media/PEHSMatrixPlaceholder.png',
  hideColumnTitles: true,
  presentationOptions: {
    Yes: {
      color: 'green',
      label: '',
      description: "**Green** indicates 'Yes' to the corresponding indicator.\n",
    },
    No: {
      color: 'red',
      label: '',
      description: "**Red** indicates 'No' to the corresponding indicator.\n",
    },
    '': {
      color: 'grey',
      label: '',
      description: "**Grey** indicates 'No data' for the corresponding indicator.\n",
    },
    'No data': {
      color: 'grey',
      label: '',
      description: "**Grey** indicates 'No data' for the corresponding indicator.\n",
    },
    applyLocation: {
      columnIndexes: [0],
    },
  },
};

const REPORT = {
  id: REPORT_ID,
  dataBuilder: 'tableOfCalculatedValues',
  dataBuilderConfig: DATA_BUILDER_CONFIG,
  viewJson: VIEW_JSON,
};

exports.up = async function (db) {
  await insertObject(db, 'dashboardReport', REPORT);

  return db.runSql(`
    UPDATE
      "dashboardGroup"
    SET
      "dashboardReports" = "dashboardReports" || '{ ${REPORT.id} }'
    WHERE
      "code" = '${DASHBOARD_GROUP_CODE}';
  `);
};

exports.down = function (db) {
  return db.runSql(`
    DELETE FROM "dashboardReport" WHERE id = '${REPORT.id}';

    UPDATE
      "dashboardGroup"
    SET
      "dashboardReports" = array_remove("dashboardReports", '${REPORT.id}')
    WHERE
      "code" = '${DASHBOARD_GROUP_CODE}';
  `);
};

exports._meta = {
  version: 1,
};
