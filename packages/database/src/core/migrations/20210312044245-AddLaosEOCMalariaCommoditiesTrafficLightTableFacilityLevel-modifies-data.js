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

const REPORT_ID = 'Laos_EOC_Malaria_Stock_Availability_Facility';

const DATA_BUILDER_CONFIG = {
  rows: [
    {
      rows: ['ACT 6x1 (Coartem)', 'ACT 6x2 (Coartem)', 'ACT 6x3 (Coartem)', 'ACT 6x4 (Coartem)'],
      category: 'ACT',
    },
    {
      rows: ['G6PD RDT'],
      category: 'G6PD',
    },
    {
      rows: ['ORS (Closing stock)'],
      category: 'ORS',
    },
    {
      rows: ['Primaquine 15 mg', 'Primaquine 7.5 mg'],
      category: 'Primaquine',
    },
    {
      rows: ['Malaria Rapid Diagnostic Test (RDT)'],
      category: 'RDT',
    },
    {
      rows: ['Artesunate 60mg'],
      category: 'Artesunate',
    },
    {
      rows: ['Paracetamol'],
      category: 'Paracetamol',
    },
  ],
  cells: [
    ['MAL_3645d4bf'],
    ['MAL_199ffeec'],
    ['MAL_46cfdeec'],
    ['MAL_566bceec'],
    ['MAL_47bb143e'],
    ['MAL_ORS'],
    ['MAL_5de7d4bf'],
    ['MAL_5de2a4bf'],
    ['MAL_47b2b43e'],
    ['MAL_Artesunate'],
    ['MAL_Paracetemol'],
  ],
  columns: ['Stock Status'],
};

const VIEW_JSON = {
  name: 'Malaria Stock Availability',
  type: 'matrix',
  placeholder: '/static/media/PEHSMatrixPlaceholder.png',
  presentationOptions: {
    type: 'condition',
    conditions: [
      {
        key: 'red',
        color: '#b71c1c',
        label: '',
        condition: 0,
        description: 'Stock number: ',
        legendLabel: 'Stock out',
      },
      {
        key: 'green',
        color: '#33691e',
        label: '',
        condition: {
          '>': 0,
        },
        description: 'Stock number: ',
        legendLabel: 'In stock',
      },
    ],
    showRawValue: true,
  },
  periodGranularity: 'one_month_at_a_time',
};

const REPORT = {
  id: REPORT_ID,
  dataBuilder: 'tableOfDataValues',
  dataBuilderConfig: DATA_BUILDER_CONFIG,
  viewJson: VIEW_JSON,
  dataServices: [{ isDataRegional: false }],
};

const DASHBOARD_GROUP_CODE = 'LAOS_EOC_Malaria_Facility';

exports.up = async function (db) {
  await insertObject(db, 'dashboardReport', REPORT);

  await db.runSql(`
    UPDATE "dashboardGroup"
    SET "dashboardReports" = "dashboardReports" || '{${REPORT.id}}'
    WHERE "code" = '${DASHBOARD_GROUP_CODE}';
  `);
};

exports.down = async function (db) {
  await db.runSql(`
     DELETE FROM "dashboardReport" WHERE id = '${REPORT.id}';

     UPDATE "dashboardGroup"
     SET "dashboardReports" = array_remove("dashboardReports", '${REPORT.id}')
     WHERE "code" = '${DASHBOARD_GROUP_CODE}';
   `);
};

exports._meta = {
  version: 1,
};
