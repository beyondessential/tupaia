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

const CODE_TO_NAME = { STR_PF05: 'PF', STR_PV05: 'PV', STR_PM05: 'PM', STR_PO05: 'PO' };

const insertIndicator = (db, code) => {
  const indicator = {
    id: generateId(),
    code: `STRIVE_PERCENTAGE_${CODE_TO_NAME[code]}_OF_TOTAL_WEEKLY`,
    builder: 'arithmetic',
    config: {
      formula: `${code} / STR_QMAL05`,
      aggregation: {
        [code]: 'SUM_EACH_WEEK',
        STR_QMAL05: 'SUM_EACH_WEEK',
      },
    },
  };
  insertObject(db, 'indicator', indicator);
};

const REPORT = {
  id: 'PG_Strive_PNG_Positive_Result_By_Type_Bar',
  dataBuilder: 'analyticsPerPeriod',
  dataBuilderConfig: {
    series: [
      { key: 'Pf +ve', dataElementCode: 'STRIVE_PERCENTAGE_PF_OF_TOTAL_WEEKLY' },
      { key: 'Pv +ve', dataElementCode: 'STRIVE_PERCENTAGE_PV_OF_TOTAL_WEEKLY' },
      { key: 'Pm +ve', dataElementCode: 'STRIVE_PERCENTAGE_PM_OF_TOTAL_WEEKLY' },
      { key: 'Po +ve', dataElementCode: 'STRIVE_PERCENTAGE_PO_OF_TOTAL_WEEKLY' },
    ],
    entityAggregation: {
      dataSourceEntityType: 'village',
      aggregationEntityType: 'facility',
      aggregationType: 'REPLACE_ORG_UNIT_WITH_ORG_GROUP',
    },
    programCodes: ['SQMAL', 'SPF', 'SPV', 'SPM', 'SPO'],
  },
  viewJson: {
    name: 'Lab Confirmed Positive Results, Bar Graph',
    type: 'chart',
    chartType: 'bar',
    chartConfig: {
      'Pf +ve': {
        stackId: 1,
      },
      'Pv +ve': {
        stackId: 1,
      },
      'Pm +ve': {
        stackId: 1,
      },
      'Po +ve': {
        stackId: 1,
      },
    },
    periodGranularity: 'week',
    presentationOptions: {
      hideAverage: true,
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
  await Promise.all(Object.keys(CODE_TO_NAME).map(code => insertIndicator(db, code)));

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
    DELETE FROM "indicator" WHERE code like 'STRIVE_PERCENTAGE_%_OF_TOTAL_WEEKLY';
  `);

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
