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

// Sub heading: "Measles and Rubella Vaccine"
// b3486q6rhgG	Measles and Rubella Vaccine, 10 doses/ vial Code: SOH_f8cf15e9
// oAGbFuZ53Ts	Measles and Rubella Vaccine, 5 doses/ vial Code: SOH_85ea65e9

// Sub heading: "Iron / Folic Acid"
// Fdb2TF3E52I	Ferrous sulfate 60mg + folic acid 0.4mg Code: SOH_41f354bf

// Sub heading: "Retinol Soft Gel Cap"
// Mkqu5ZVE3C1	Retinol 100,000 IU soft get cap Code: SOH_61d3f4bf
// QaC3fjHFJvN	Retinol 200,000 IU soft get cap Code: SOH_61fe94bf

const getDatabuilderConfig = (columns, cells) => ({
  rows: [
    {
      rows: [
        'Measles and Rubella Vaccine, 5 doses / vial',
        'Measles and Rubella Vaccine, 10 doses / vial',
      ],
      category: 'Measles and Rubella Vaccine',
    },
    {
      rows: ['Ferrous sulfate 60mg + folic acid 0.4mg'],
      category: 'Iron / Folic Acid',
    },
    {
      rows: ['Retinol 100,000 IU soft get cap', 'Retinol 200,000 IU soft get cap'],
      category: 'Retinol Soft Gel Cap',
    },
  ],
  cells,
  columns,
  entityAggregation: {
    dataSourceEntityType: 'facility',
  },
});

const viewJson = {
  name: 'Measles Commodities',
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

const reports = [
  // sub district
  {
    config: {
      id: 'Laos_EOC_Measles_Stock_Availability_Sub_District',
      dataBuilder: 'tableOfValuesForOrgUnits',
      dataBuilderConfig: getDatabuilderConfig('$orgUnit', [
        'SOH_f8cf15e9',
        'SOH_85ea65e9',
        'LA_SOH_41e9d4bf',
        'LA_SOH_61d3f4bf',
        'LA_SOH_61fe94bf',
      ]),
      viewJson,
      dataServices: [{ isDataRegional: false }],
    },
    dashboardGroupCode: 'LAOS_EOC_Measles_Sub_District',
  },
  // facility
  {
    config: {
      id: 'Laos_EOC_Measles_Stock_Availability_Facility',
      dataBuilder: 'tableOfDataValues',
      dataBuilderConfig: getDatabuilderConfig(
        ['Stock Status'],
        [
          ['SOH_f8cf15e9'],
          ['SOH_85ea65e9'],
          ['LA_SOH_41e9d4bf'],
          ['LA_SOH_61d3f4bf'],
          ['LA_SOH_61fe94bf'],
        ],
      ),
      viewJson,
      dataServices: [{ isDataRegional: false }],
    },
    dashboardGroupCode: 'LAOS_EOC_Measles_Facility',
  },
];

exports.up = async function (db) {
  await Promise.all(reports.map(report => insertObject(db, 'dashboardReport', report.config)));

  await Promise.all(
    reports.map(report =>
      db.runSql(`
        UPDATE "dashboardGroup"
        SET "dashboardReports" = "dashboardReports" || '{${report.config.id}}'
        WHERE "code" = '${report.dashboardGroupCode}';
      `),
    ),
  );
};

exports.down = async function (db) {
  await Promise.all(
    reports.map(report =>
      db.runSql(`
        UPDATE "dashboardGroup"
        SET "dashboardReports" = array_remove("dashboardReports", '${report.config.id}')
        WHERE "code" = '${report.dashboardGroupCode}';
      
        DELETE FROM "dashboardReport" WHERE id = '${report.config.id}';
      `),
    ),
  );
};

exports._meta = {
  version: 1,
};
