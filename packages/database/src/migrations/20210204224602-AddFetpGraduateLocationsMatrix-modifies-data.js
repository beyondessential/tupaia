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
  // dataBuilder: 'tableOfDataValues',
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
  // FETPNG20Data_034 	District
  // FETPNG20Data_033 	Province
  // FETPNG20Data_009 	Work Category
  columns: {
    // National: {
    //   ancestorType: 'district',
    //   filter: 'PG_National Capital District', // 'National Capital District',
    // },
    Provinces: {
      ancestorType: 'district',
    },
    Districts: {
      ancestorType: 'sub_district',
    },
  },
  viewJson: {
    name: 'FETP Graduate Locations, PNG',
    type: 'matrix',
    placeholder: '/static/media/PEHSMatrixPlaceholder.png',
    noDataMessage: ' ',
  },
  dataServices: [{ isDataRegional: true }],

  cellConfig: (column, value, report) => {
    // return 'FETPNG20Data_009';
    return {
      key: `${column}_${value}_Count`,
      dataValues: ['FETPNG20Data_009'],
      dataElement: 'FETPNG20Data_034',
      aggregationType: 'COUNT',
      // operator: 'COUNT',
      aggregationConfig: {
        countCondition: {
          value,
          operator: 'regex',
        },
      },
    };
    // return {
    //   operator: 'GROUP',
    //   condition: {
    //     value: '*',
    //     operator: 'regex',
    //   },
    //   dataElement: 'FETPNG20Data_034',
    // };
    // return {
    //   key: `${column}_${value}_Count`,
    //   operator: 'CHECK_CONDITION',
    //   condition: {
    //     value: '*',
    //     operator: 'regex',
    //   },
    //   dataElement: 'FETPNG20Data_034',
    // };
  },
};
const dashboardGroups = ['PG_FETP_Country_Public', 'PG_FETP_District_Public'];

const buildReport = report => {
  const dataBuilderConfig = {
    rows: report.dataValues.map(dv => dv.split(' = ')[1]),
    columns: Object.keys(report.columns),
    cells: report.dataValues.map(dv =>
      Object.keys(report.columns).map(col => report.cellConfig(col, dv, report)),
    ),
    entityAggregation: {
      dataSourceEntityType: ['individual'],
      // aggregationEntityType: 'country',
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
console.log('report:', report);

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
