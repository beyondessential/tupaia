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
const OLD_CONFIG = {
  rows: ['Delivery', 'ANC', 'PNC', 'Number of Facilities Surveyed'],
  cells: [
    [
      {
        calc: 'SUM',
        dataElement: 'RHS3UNFPA644',
      },
    ],
    [
      {
        calc: 'SUM',
        dataElement: 'RHS3UNFPA633',
      },
    ],
    [
      {
        calc: 'SUM',
        dataElement: 'RHS3UNFPA636',
      },
    ],
    [
      {
        calc: 'COUNT_ENTITIES_IN_ANALYTICS',
        dataElement: 'NONE',
      },
    ],
  ],
  columns: {
    type: '$period',
    periodType: 'quarter',
    aggregationType: 'FINAL_EACH_QUARTER',
  },
  entityAggregation: {
    dataSourceEntityType: 'facility',
  },
};

const NEW_CONFIG = {
  rows: ['Delivery', 'ANC', 'PNC', 'Family Planning', 'Number of Facilities Surveyed'],
  cells: [
    [
      {
        calc: 'SUM',
        dataElement: 'RHS3UNFPA644',
      },
    ],
    [
      {
        calc: 'SUM',
        dataElement: 'RHS3UNFPA633',
      },
    ],
    [
      {
        calc: 'SUM',
        dataElement: 'RHS3UNFPA636',
      },
    ],
    [
      {
        calc: 'SUM',
        dataElement: 'RHS4UNFPA878',
      },
    ],
    [
      {
        calc: 'COUNT_ENTITIES_IN_ANALYTICS',
        dataElement: 'NONE',
      },
    ],
  ],
  columns: {
    type: '$period',
    periodType: 'quarter',
    aggregationType: 'FINAL_EACH_QUARTER',
  },
  entityAggregation: {
    dataSourceEntityType: 'facility',
  },
};

const OLD_CONFIG_FACILITY = {
  rows: ['Delivery', 'ANC', 'PNC'],
  cells: [['RHS3UNFPA644'], ['RHS3UNFPA633'], ['RHS3UNFPA636']],
  columns: {
    name: '# women',
    type: '$period',
    periodType: 'quarter',
    aggregationType: 'FINAL_EACH_QUARTER',
    fillEmptyPeriods: true,
  },
  baselineColumns: [
    {
      name: 'Does this facility offer the service?',
      dataElements: ['RHS3UNFPA536', 'RHS3UNFPA4121', 'RHS3UNFPA464'],
    },
  ],
};

const NEW_CONFIG_FACILITY = {
  rows: ['Delivery', 'ANC', 'PNC', 'Family Planning'],
  cells: [['RHS3UNFPA644'], ['RHS3UNFPA633'], ['RHS3UNFPA636'], ['RHS4UNFPA878']],
  columns: {
    name: '# women',
    type: '$period',
    periodType: 'quarter',
    aggregationType: 'FINAL_EACH_QUARTER',
    fillEmptyPeriods: true,
  },
  baselineColumns: [
    {
      name: 'Does this facility offer the service?',
      dataElements: ['RHS3UNFPA536', 'RHS3UNFPA4121', 'RHS3UNFPA464', 'RHS4UNFPA807'],
    },
  ],
};

exports.up = function (db) {
  return db.runSql(`
    update "dashboardReport"
    set "dataBuilderConfig" = '${JSON.stringify(NEW_CONFIG)}'::jsonb
    where id = 'UNFPA_RH_Number_Of_Women_Provided_SRH_Services_Matrix_National_Provincial';

    update "dashboardReport"
    set "dataBuilderConfig" = '${JSON.stringify(NEW_CONFIG_FACILITY)}'::jsonb
    where id = 'UNFPA_RH_Number_Of_Women_Provided_SRH_Services_Matrix';
  `);
};

exports.down = function (db) {
  return db.runSql(`
    update "dashboardReport"
    set "dataBuilderConfig" = '${JSON.stringify(OLD_CONFIG)}'::jsonb
    where id = 'UNFPA_RH_Number_Of_Women_Provided_SRH_Services_Matrix_National_Provincial';

    update "dashboardReport"
    set "dataBuilderConfig" = '${JSON.stringify(OLD_CONFIG_FACILITY)}'::jsonb
    where id = 'UNFPA_RH_Number_Of_Women_Provided_SRH_Services_Matrix';
  `);
};

exports._meta = {
  version: 1,
};
