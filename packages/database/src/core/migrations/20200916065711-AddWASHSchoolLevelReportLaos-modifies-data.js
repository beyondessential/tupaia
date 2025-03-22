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

const REPORT_ID = 'Laos_Schools_WASH_School_Table';

const DATA_BUILDER_CONFIG = {
  rows: [
    'Functioning hand washing facilities',
    'Access to water supply',
    'Access to water supply all year round',
    'Access to clean drinking water',
    'Hygiene promotion training in last 3 years',
  ],
  cells: [
    [
      'SchFF004',
      {
        key: 'Formatted_SchCVD008',
        operator: 'FORMAT',
        dataElement: 'SchCVD008',
        format: 'Number of hand washing tables: {value}',
      },
    ],
    [
      'BCD29_event',
      {
        key: 'Type_of_Water_Supply',
        operator: 'COMBINE_BINARY_AS_STRING',
        dataElementToString: {
          SchCVD010d: 'Spring water (gravity-fed system)',
          SchCVD010e: 'River/stream',
          SchCVD010g: 'Reservoir',
          SchCVD010i: 'Rainwater harvesting',
          SchCVD010h: 'Other',
          SchCVD010f: 'Pond',
          SchCVD010a: 'Tap water',
          SchCVD010b: 'Borehole',
          SchCVD010c: 'Well',
        },
      },
    ],
    ['SchCVD010l'],
    ['SchCVD028', 'SchCVD029'],
    ['SchCVD007'],
  ],
  columns: ['Main', 'Extra'],
  entityAggregation: {
    dataSourceEntityType: 'school',
  },
};

const VIEW_JSON = {
  name: 'Water, Sanitation and Hygiene (WASH)',
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
