'use strict';

import { insertObject } from '../utilities/migration';
import { generateId } from '../utilities/generateId';

var dbm;
var type;
var seed;

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */

const DATA_ELEMENT_CODES = ['STR_QMAL05', 'STR_PF05', 'STR_PV05', 'STR_PM05', 'STR_PO05'];

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
    entityAggregation: {
      dataSourceEntityType: 'village',
      aggregationEntityType: 'facility',
      aggregationType: 'SUM_PER_PERIOD_PER_ORG_GROUP',
    },
    programCodes: ['SQMAL', 'SPF', 'SPV', 'SPM', 'SPO'],
    aggregationType: 'RAW',
  },
  viewJson: {
    name: 'Lab Confirmed Positive Results, Line Graph',
    type: 'chart',
    chartType: 'line',
    periodGranularity: 'week',
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
