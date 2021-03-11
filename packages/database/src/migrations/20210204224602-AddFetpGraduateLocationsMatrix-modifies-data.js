'use strict';

import { arrayToDbString, insertObject } from '../utilities';

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

const reportConfig = {
  id: 'FETP_PG_graduate_locations',
  dataBuilder: 'tableOfCalculatedValues',
  dataValues: [
    'HEO = Health Extension Officer',
    'MO = Medical Officer',
    'NO = Nursing Officer',
    'DHO = District Health Officer',
    'EHO = Environmental Health Officer',
    'PDCO = Provincial Disease Control Officer',
    'SO = Surveillance Officer',
    // 'SO-Intnl = Surveillance Officer - International'
  ],

  columns: {
    National: {
      organisationUnit: {
        parent: {
          code: 'PG_National Capital District', // 'National Capital District'
        },
      },
    },
    Provinces: {
      organisationUnit: {
        parent: {
          type: 'district',
          code: {
            operator: '<>',
            value: 'PG_National Capital District', // 'National Capital District'
          },
        },
      },
    },
    Districts: {
      organisationUnit: {
        parent: {
          type: 'sub_district',
          code: {
            operator: '<>',
            value: 'PG_National Capital District', // 'National Capital District'
          },
        },
      },
    },
  },
  viewJson: {
    name: 'FETP Graduate Locations, PNG',
    type: 'matrix',
    placeholder: '/static/media/PEHSMatrixPlaceholder.png',
    noDataMessage: ' ',
  },
  dataServices: [{ isDataRegional: true }],

  cellConfig: (column, value, filter) => {
    return {
      key: `${column}_${value}_count`,
      filter,
      dataElement: 'FETPNG20Data_009',
      aggregationType: 'COUNT',
      aggregationConfig: {
        countCondition: {
          value,
          operator: '=',
        },
      },
      operator: 'COUNT_CONDITION',
    };
  },
};
const dashboardGroups = ['PG_FETP_Country_Public'];

const buildReport = report => {
  const dataBuilderConfig = {
    rows: report.dataValues.map(dv => dv.split(' = ')[1]),
    columns: Object.keys(report.columns),
    cells: report.dataValues.map(dv =>
      Object.keys(report.columns).map(col => report.cellConfig(col, dv, report.columns[col])),
    ),
    entityAggregation: {
      dataSourceEntityType: ['individual'],
      aggregationType: 'RAW',
    },
  };
  return {
    id: report.id,
    dataBuilder: report.dataBuilder,
    dataBuilderConfig,
    viewJson: report.viewJson,
    dataServices: report.dataServices,
  };
};
const report = buildReport(reportConfig);

exports.up = async function (db) {
  await insertObject(db, 'dashboardReport', report);

  return db.runSql(`
    update "dashboardGroup" 
    set "dashboardReports" = "dashboardReports" || '{${report.id}}' 
    where code in (${arrayToDbString(dashboardGroups)});
  `);
};

exports.down = function (db) {
  return db.runSql(`
    update "dashboardGroup" 
    set "dashboardReports" = array_remove("dashboardReports", '${report.id}')
    where code in (${arrayToDbString(dashboardGroups)});

    delete from "dashboardReport" where id = '${report.id}';
  `);
};

exports._meta = {
  version: 1,
};
