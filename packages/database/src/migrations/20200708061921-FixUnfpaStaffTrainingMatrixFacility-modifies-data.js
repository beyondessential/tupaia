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

const dashboardReportId = 'UNFPA_Staff_Trained_Matrix';

const originalDatabuilder = 'tableOfDataValuesWithCalc';
const originalDataBuilderConfig = {
  rows: [
    'Staff trained in the provision of modern contraceptives',
    'ANC (including part time staff)',
    'Service providers trained to detect, discuss, and refer clients to services that handle sexual and gender-based violence',
    'Staff trained in delivery services',
    'Have any staff been trained to provide services to survivors of rape or other gender based violence?',
    'Have any staff been trained to provide SRH services to adolescents and youth',
  ],
  cells: [
    ['BAYUI37nJ27'],
    [
      {
        action: 'SUM',
        dataValues: ['xDT68q89i7J', 'WGsYZDuaE2w', 'QleUiYGlH2K', 'GtrLIeauSmj', 'PVMX8m9KrgT'],
        dataElement: 'PVMX8m9KrgT',
      },
    ],
    ['YRdwZOXcj6s'],
    ['pHp0X0JkZQH'],
    ['JIvHqMTozrX'],
    ['aoZkMRVLynz'],
  ],
  columns: [
    {
      name: 'Base Line',
      showYear: 'true',
    },
    'Q1',
    'Q2',
    'Q3',
    'Q4',
  ],
  MaxBaseLine: '2020-01-01',
  MinBaseLine: '2018-01-01',
  dataElementGroupCode: 'SRHStaffTraining',
};

const newDatabuilder = 'tableOfValuesPerPeriod';

const newDatabuilderConfig = {
  rows: [
    'Staff trained in the provision of modern contraceptives',
    'ANC (including part time staff)',
    'Service providers trained to detect, discuss, and refer clients to services that handle sexual and gender-based violence',
    'Staff trained in delivery services',
    'Have any staff been trained to provide services to survivors of rape or other gender based violence?',
    'Have any staff been trained to provide SRH services to adolescents and youth',
  ],
  cells: [
    [
      {
        calc: 'SUM',
        dataElement: 'RHS4UNFPA809',
      },
    ],
    [
      {
        calc: 'SUM',
        dataElement: [
          'RHS1UNFPA5601',
          'RHS1UNFPA57',
          'RHS1UNFPA5902',
          'RHS1UNFPA60',
          'RHS1UNFPA6001',
          'RHS1UNFPA61',
        ],
      },
    ],
    [
      {
        calc: 'SUM',
        dataElement: 'RHS2UNFPA292',
      },
    ],
    [
      {
        calc: 'SUM',
        dataElement: 'RHS3UNFPA5410',
      },
    ],
    [
      {
        calc: 'YESNO',
        dataElement: 'RHS2UNFPA291',
      },
    ],
    [
      {
        calc: 'YESNO',
        dataElement: 'RHS2UNFPA240',
      },
    ],
  ],
  columns: {
    type: '$period',
    periodType: 'quarter',
    aggregationType: 'FINAL_EACH_QUARTER',
    fillEmptyPeriods: true,
  },
  baselineColumns: [
    {
      name: 'Base Line',
      showYear: 'true',
      dataElements: [
        'RHS1UNFPA5601',
        'RHS1UNFPA57',
        'RHS1UNFPA5902',
        'RHS1UNFPA60',
        'RHS1UNFPA6001',
        'RHS1UNFPA61',
      ],
      dataElementGroupCode: 'SRHStaffTraining',
    },
  ],
};

exports.up = function(db) {
  return db.runSql(`
    UPDATE "dashboardReport"
    SET "dataBuilder" = '${newDatabuilder}',
        "dataBuilderConfig" = '${JSON.stringify(newDatabuilderConfig)}'
    WHERE id = '${dashboardReportId}';
  `);
};

exports.down = function(db) {
  return db.runSql(`
    UPDATE "dashboardReport"
    SET "dataBuilder" = '${originalDatabuilder}',
        "dataBuilderConfig" = '${JSON.stringify(originalDataBuilderConfig)}'
    WHERE id = '${dashboardReportId}';
  `);
};

exports._meta = {
  version: 1,
};
