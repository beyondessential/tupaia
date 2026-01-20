'use strict';

import { codeToId, generateId, insertObject } from '../utilities';

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
  code: 'FETP_PG_graduate_locations_district',
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
    'Provincial Level': {
      organisationUnit: {
        parent: {
          type: 'district',
        },
      },
    },
    'District Level': {
      organisationUnit: {
        parent: {
          type: 'sub_district',
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
const dashboardCode = ['PG_FETP'];

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
    code: report.code,
    dataBuilder: report.dataBuilder,
    dataBuilderConfig,
    viewJson: report.viewJson,
    dataServices: report.dataServices,
  };
};
const report = buildReport(reportConfig);

exports.up = async function (db) {
  const dashboardItemId = generateId();
  const dashboardId = await codeToId(db, 'dashboard', dashboardCode);
  await insertObject(db, 'legacy_report', {
    id: generateId(),
    code: report.code,
    data_builder: report.dataBuilder,
    data_builder_config: report.dataBuilderConfig,
    data_services: report.dataServices,
  });
  await insertObject(db, 'dashboard_item', {
    id: dashboardItemId,
    code: report.code,
    report_code: report.code,
    legacy: true,
    config: report.viewJson,
  });
  await insertObject(db, 'dashboard_relation', {
    id: generateId(),
    dashboard_id: dashboardId,
    child_id: dashboardItemId,
    entity_types: '{district,sub_district}',
    project_codes: '{fetp}',
    permission_groups: '{Public}',
    sort_order: 3,
  });
};

exports.down = async function (db) {
  const dashboardItemId = await codeToId(db, 'dashboard_item', report.code);
  const dashboardId = await codeToId(db, 'dashboard', dashboardCode);
  return db.runSql(`
    delete from "legacy_report" where code = '${report.code}';
    delete from "dashboard_item" where code = '${report.code}';
    delete from "dashboard_relation" where dashboard_id = '${dashboardId}' and child_id = '${dashboardItemId}';
  `);
};

exports._meta = {
  version: 1,
};
