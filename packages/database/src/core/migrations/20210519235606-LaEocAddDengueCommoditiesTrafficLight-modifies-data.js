'use strict';

import { arrayToDbString, generateId, insertObject } from '../utilities';

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

const dataSources = [
  // LA_SOH_559794bf eKWzHRGV4Vy 	Paracetamol 500 mg
  {
    id: generateId(),
    code: 'LA_SOH_559794bf',
    type: 'dataElement',
    service_type: 'dhis',
    config: { dhisId: 'eKWzHRGV4Vy', isDataRegional: false },
  },
  // LA_SOH_478a343e r78zgTs3U43 	Oral Sol Powder 20.5g*20
  {
    id: generateId(),
    code: 'LA_SOH_478a343e',
    type: 'dataElement',
    service_type: 'dhis',
    config: { dhisId: 'r78zgTs3U43', isDataRegional: false },
  },
  // Sub heading: "Oral Rehydration Salt
  // LA_SOH_d55ddc00 vlftBWjzl7S  	Oral Rehydration Salt Orange 3.3g
  {
    id: generateId(),
    code: 'LA_SOH_d55ddc00',
    type: 'dataElement',
    service_type: 'dhis',
    config: { dhisId: 'vlftBWjzl7S', isDataRegional: false },
  },
  // LA_SOH_08491c00 x3hnyjBFwqs 	Oral Rehydration Salt 5g
  {
    id: generateId(),
    code: 'LA_SOH_08491c00',
    type: 'dataElement',
    service_type: 'dhis',
    config: { dhisId: 'x3hnyjBFwqs', isDataRegional: false },
  },
  // LA_SOH_477d943e zr4pznzsg1L 	Oral Rehydration Salt 42g
  {
    id: generateId(),
    code: 'LA_SOH_477d943e',
    type: 'dataElement',
    service_type: 'dhis',
    config: { dhisId: 'zr4pznzsg1L', isDataRegional: false },
  },
  // LA_SOH_9dd1cc00 A9pngHYYgBr 	Oral Rehydration Salt 3.3g
  {
    id: generateId(),
    code: 'LA_SOH_9dd1cc00',
    type: 'dataElement',
    service_type: 'dhis',
    config: { dhisId: 'A9pngHYYgBr', isDataRegional: false },
  },

  // Sub heading: "Oral Rehydration Salt Powder"
  // LA_SOH_4777c43e rsMZx9Ly5dM 	Oral Rehydration Salt 29g Powder
  {
    id: generateId(),
    code: 'LA_SOH_4777c43e',
    type: 'dataElement',
    service_type: 'dhis',
    config: { dhisId: 'rsMZx9Ly5dM', isDataRegional: false },
  },
  // LA_SOH_4771c43e D1YXUIwOcEj 	Oral Rehydration Salt 27.9g Powder (Orange flavor)
  {
    id: generateId(),
    code: 'LA_SOH_4771c43e',
    type: 'dataElement',
    service_type: 'dhis',
    config: { dhisId: 'D1YXUIwOcEj', isDataRegional: false },
  },
  // LA_SOH_476b743e LUJbmqaEWjK 	Oral Rehydration Salt 27.9g Powder
  {
    id: generateId(),
    code: 'LA_SOH_476b743e',
    type: 'dataElement',
    service_type: 'dhis',
    config: { dhisId: 'lUJbmqaEWjK', isDataRegional: false },
  },
];

const newDengueGroup = {
  organisationLevel: 'Facility',
  userGroup: 'Laos EOC User',
  organisationUnitCode: 'LA',
  dashboardReports: '{}',
  name: 'Dengue',
  code: 'LAOS_EOC_Dengue_Facility',
  projectCodes: '{laos_eoc}',
};

const getDatabuilderConfig = (columns, cells) => ({
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
      rows: ['Paracetamol 500 mg'],
      category: 'Paracetamol',
    },
    {
      rows: ['Oral Sol Powder 20.5g*20'],
      category: 'Oral Sol Powder',
    },
  ],
  cells,
  columns,
  entityAggregation: {
    dataSourceEntityType: 'facility',
  },
  categoryAggregator: {
    type: '$condition',
    conditions: [
      {
        key: 'green',
        condition: {
          '>': 0,
        },
      },
      {
        key: 'orange',
        condition: {
          someNotAll: { '>': 0 },
        },
      },
      {
        key: 'grey',
        condition: {
          '=': null,
        },
      },
      {
        key: 'red',
        condition: {
          in: [0, null],
        },
      },
    ],
  },
});

const viewJson = {
  name: 'Dengue Commodities (mSupply SOH)',
  type: 'matrix',
  placeholder: '/static/media/PEHSMatrixPlaceholder.png',
  presentationOptions: {
    type: 'condition',
    conditions: [
      {
        key: 'red',
        color: '#b71c1c',
        label: 'Stock number: 0',
        condition: 0,
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
      {
        key: 'orange',
        color: 'orange',
        label: '',
        legendLabel: 'At least 1 item out of stock',
      },
    ],
    showRawValue: true,
  },
  categoryPresentationOptions: {
    conditions: {
      red: {
        color: '#b71c1c',
        label: '',
        legendLabel: 'Stock out',
      },
      green: {
        color: '#33691e',
        label: '',
        legendLabel: 'In stock',
      },
      orange: {
        color: 'orange',
        label: '',
        legendLabel: 'At least 1 item out of stock',
      },
      grey: {
        color: '',
        label: 'No Data',
        legendLabel: 'No Data',
      },
    },
    showRawValue: true,
    showNestedRows: true,
  },
  periodGranularity: 'one_month_at_a_time',
};

const reports = [
  // sub district
  {
    config: {
      id: 'Laos_EOC_Dengue_Commodities_Sub_District',
      dataBuilder: 'tableOfValuesForOrgUnits',
      dataBuilderConfig: getDatabuilderConfig('$orgUnit', [
        'LA_SOH_d55ddc00',
        'LA_SOH_08491c00',
        'LA_SOH_477d943e',
        'LA_SOH_9dd1cc00',
        'LA_SOH_4777c43e',
        'LA_SOH_4771c43e',
        'LA_SOH_476b743e',
        'LA_SOH_559794bf',
        'LA_SOH_478a343e',
      ]),
      viewJson,
      dataServices: [{ isDataRegional: false }],
    },
    dashboardGroupCode: 'LAOS_EOC_Dengue_Sub_District',
  },
  // facility
  {
    config: {
      id: 'Laos_EOC_Dengue_Commodities_Facility',
      dataBuilder: 'tableOfDataValues',
      dataBuilderConfig: getDatabuilderConfig(
        ['Stock Status'],
        [
          ['LA_SOH_d55ddc00'],
          ['LA_SOH_08491c00'],
          ['LA_SOH_477d943e'],
          ['LA_SOH_9dd1cc00'],
          ['LA_SOH_4777c43e'],
          ['LA_SOH_4771c43e'],
          ['LA_SOH_476b743e'],
          ['LA_SOH_559794bf'],
          ['LA_SOH_478a343e'],
        ],
      ),
      viewJson,
      dataServices: [{ isDataRegional: false }],
    },
    dashboardGroupCode: 'LAOS_EOC_Dengue_Facility',
  },
];

exports.up = async function (db) {
  await Promise.all(dataSources.map(dataSource => insertObject(db, 'data_source', dataSource)));

  await insertObject(db, 'dashboardGroup', newDengueGroup);

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
  await db.runSql(`
    delete from "data_source" where code in (${arrayToDbString(dataSources.map(ds => ds.code))});
    delete from "dashboardGroup" where code = '${newDengueGroup.code}';
  `);
};

exports._meta = {
  version: 1,
};
