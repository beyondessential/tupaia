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
  services: 'UNFPA_Facilities_Offering_Services',
  delivery: 'UNFPA_Facilities_Offering_Delivery',
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

const createPercentage = dataElementCode => ({
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
});

const insertReports = async db => {
  await insertObject(db, 'dashboardReport', {
    id: REPORT_IDS['services'],
    dataBuilder: 'percentagesOfValueCountsPerPeriod',
    dataBuilderConfig: {
      dataClasses: {
        'Family Planning': createPercentage('RHS4UNFPA807'),
        'ANC Services': createPercentage('RHS3UNFPA4121'),
        'PNC Services': createPercentage('RHS3UNFPA464'),
      },
      periodType: 'month',
    },
    viewJson: {
      ...BASE_VIEW_JSON,
      name: '% of Facilities Offering Services',
      chartConfig: {
        'Family Planning': {},
        'ANC Services': {},
        'PNC Services': {},
      },
    },
  });

  return insertObject(db, 'dashboardReport', {
    id: REPORT_IDS['delivery'],
    dataBuilder: 'percentagesOfValueCountsPerPeriod',
    dataBuilderConfig: {
      dataClasses: {
        delivery: createPercentage('RHS3UNFPA536'),
      },
      periodType: 'month',
    },
    viewJson: {
      ...BASE_VIEW_JSON,
      name: '% of Facilities Offering Delivery',
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
