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

const REPORT_ID = 'Laos_EOC_Dengue_Stock_Availability_Facility';

const DATA_BUILDER_CONFIG = {
  rows: [
    {
      rows: [
        'Oral Rehydration Salt Orange 3.3g',
        'Oral Rehydration Salt 5g',
        'Oral Rehydration Salt 42g',
        'Oral Rehydration Salt 3.3g',
      ],
      category: 'Oral Rehydration Salt',
    },
    {
      rows: [
        'Oral Rehydration Salt 29g Powder',
        'Oral Rehydration Salt 27.9g Powder (Orange flavor)',
        'Oral Rehydration Salt 27.9g Powder',
      ],
      category: 'Oral Rehydration Salt Powder',
    },
    {
      rows: ['Oral Sol Powder 20.5g*20'],
      category: 'Oral Sol Powder',
    },
    {
      rows: ['Paracetamol 500 mg'],
      category: 'Paracetamol',
    },
  ],
  cells: [
    ['mSupply_d55ddc00'],
    ['mSupply_08491c00'],
    ['mSupply_477d943e'],
    ['mSupply_9dd1cc00'],
    ['mSupply_4777c43e'],
    ['mSupply_4771c43e'],
    ['mSupply_476b743e'],
    ['mSupply_478a343e'],
    ['mSupply_559794bf'],
  ],
  columns: ['Stock Status'],
  entityAggregation: {
    dataSourceEntityType: 'facility',
  },
};

const VIEW_JSON = {
  name: 'Dengue Stock Availability (mSupply SOH)',
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

const DASHBOARD_GROUP_CODE = 'LAOS_EOC_Dengue_Facility';

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
