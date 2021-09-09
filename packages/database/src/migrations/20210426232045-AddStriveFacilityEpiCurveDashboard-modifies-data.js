'use strict';

import { insertObject } from '../utilities/migration';

var dbm;
var type;
var seed;

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */

const REPORT = {
  id: 'PG_Strive_PNG_Facility_EpiCurve',
  dataBuilder: 'analyticsPerPeriod',
  dataBuilderConfig: {
    series: [
      { key: 'QMAL +ve', dataElementCode: 'STR_QMAL05' },
      { key: 'Pf +ve', dataElementCode: 'STR_PF05' },
      { key: 'Pv +ve', dataElementCode: 'STR_PV05' },
      { key: 'Pm +ve', dataElementCode: 'STR_PM05' },
      { key: 'Po +ve', dataElementCode: 'STR_PO05' },
    ],
    aggregationType: 'SUM_EACH_WEEK',
    entityAggregation: {
      dataSourceEntityType: 'case',
      aggregationEntityType: 'facility',
      aggregationType: 'SUM_PER_PERIOD_PER_ORG_GROUP',
    },
  },
  viewJson: {
    name: 'Lab Confirmed Positive Results, Line Graph',
    type: 'chart',
    valueType: 'number',
    chartType: 'line',
    periodGranularity: 'week',
    chartConfig: {
      'QMAL +ve': {},
      'Pf +ve': {},
      'Pm +ve': {},
      'Po +ve': {},
      'Pv +ve': {},
    },
  },
};
const DASHBOARD_GROUP_CODE = 'PG_Strive_PNG_Facility';

exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = async function (db) {
  await insertObject(db, 'dashboardReport', REPORT);
  await db.runSql(`
    UPDATE
      "dashboardGroup"
    SET
      "dashboardReports" = "dashboardReports" || '{ ${REPORT.id} }'
    WHERE
      "code" = '${DASHBOARD_GROUP_CODE}';
  `);
};

exports.down = async function (db) {
  await db.runSql(`
    DELETE FROM "dashboardReport" WHERE id = '${REPORT.id}';
    UPDATE
      "dashboardGroup"
    SET
      "dashboardReports" = array_remove("dashboardReports", '${REPORT.id}')
    WHERE
      "code" = '${DASHBOARD_GROUP_CODE}';
  `);
};

exports._meta = {
  version: 1,
};
