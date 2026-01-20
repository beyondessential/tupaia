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

const REPORT_ID = 'Laos_Schools_ICT_Facilities';

const DATA_BUILDER_CONFIG = {
  rows: [
    'Electricity Available',
    'Functioning TV for teaching and learning purposes',
    'Functioning smart TV',
    'Lao satellite receiver and dish set',
    'Functioning computer',
    'Functioning projector',
  ],
  cells: [
    ['SchFF001', 'SchCVD011'],
    ['SchCVD012'],
    ['SchCVD012a'],
    ['SchCVD012b'],
    ['SchCVD013', 'SchCVD014'],
    ['SchCVD015'],
  ],
  columns: ['Main', 'Extra'],
  entityAggregation: {
    dataSourceEntityType: 'school',
  },
};

const VIEW_JSON = {
  name: 'ICT Facilities',
  type: 'matrix',
  placeholder: '/static/media/PEHSMatrixPlaceholder.png',
  hideColumnTitles: true,
  presentationOptions: {
    Yes: {
      color: 'green',
      label: '',
      description: "**Green** indicates 'Yes' for the corresponding indicator.\n",
    },
    No: {
      color: 'red',
      label: '',
      description: "**Red** indicates 'No' for the corresponding indicator.\n",
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
  dataBuilder: 'tableOfDataValues',
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
