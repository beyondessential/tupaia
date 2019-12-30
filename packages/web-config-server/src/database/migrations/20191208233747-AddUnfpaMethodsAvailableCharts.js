'use strict';

import { insertObject } from '../migrationUtilities';

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

const REPORT_IDS = {
  '3methods': 'UNFPA_Monthly_3_Methods_of_Contraception',
  '5methods': 'UNFPA_Monthly_5_Methods_of_Contraception',
};

const BASE_VIEW_JSON = {
  type: 'chart',
  chartType: 'line',
  valueType: 'percentage',
  periodGranularity: 'month',
};

const DASHBOARD_GROUPS = [
  'WS_Unfpa_Country',
  'WS_Unfpa_Province',
  'MH_Unfpa_Country',
  'MH_Unfpa_Province',
];

const inList = arr => `(${arr.map(item => `'${item}'`).join(',')})`;

const createDataBuilderConfig = dataElementCode => ({
  dataClasses: {
    value: {
      numerator: {
        dataValues: {
          [dataElementCode]: 1,
        },
      },
      denominator: {
        dataValues: {
          [dataElementCode]: '*',
        },
      },
    },
  },
  periodType: 'month',
});

const insertReports = async db => {
  await insertObject(db, 'dashboardReport', {
    id: REPORT_IDS['3methods'],
    dataBuilder: 'percentagesOfValueCountsPerPeriod',
    dataBuilderConfig: createDataBuilderConfig('RHS6UNFPA1354'),
    viewJson: {
      ...BASE_VIEW_JSON,
      name: 'Facilities Offering 3 Methods of Contraception',
    },
  });

  return insertObject(db, 'dashboardReport', {
    id: REPORT_IDS['5methods'],
    dataBuilder: 'percentagesOfValueCountsPerPeriod',
    dataBuilderConfig: createDataBuilderConfig('RHS6UNFPA1355'),
    viewJson: {
      ...BASE_VIEW_JSON,
      name: 'Facilities Offering 5 Methods of Contraception',
    },
  });
};

const insertReportsInGroup = async (db, dashboardGroup) =>
  db.runSql(`
    UPDATE
      "dashboardGroup"
    SET 
      "dashboardReports" = "dashboardReports" || '{${Object.values(REPORT_IDS)}}'
    WHERE
      code = '${dashboardGroup}';
`);

const removeDashboardReportFromGroup = async (db, reportId) => {
  await db.runSql(`
  UPDATE
    "dashboardGroup"
  SET 
    "dashboardReports" = array_remove("dashboardReports", '${reportId}')
  WHERE
    code in ${inList(DASHBOARD_GROUPS)};
`);
};

exports.up = async function(db) {
  await insertReports(db);
  for (const dashboardGroup of DASHBOARD_GROUPS) {
    await insertReportsInGroup(db, dashboardGroup);
  }
};

exports.down = async function(db) {
  for (const reportId of Object.values(REPORT_IDS)) {
    await removeDashboardReportFromGroup(db, reportId);
  }
  return db.runSql(
    `DELETE FROM "dashboardReport" WHERE id in ${inList(Object.values(REPORT_IDS))};
  `,
  );
};

exports._meta = {
  version: 1,
};
