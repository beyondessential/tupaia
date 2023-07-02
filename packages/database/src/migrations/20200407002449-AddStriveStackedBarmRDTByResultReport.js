'use strict';

import { insertObject } from '../utilities/migration';
import { arrayToDbString } from '../utilities';

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

const DASHBOARD_GROUP_CODES = ['PG_Strive_PNG_Facility'];

const REPORT = {
  id: 'PG_Strive_PNG_Positive_RDT_By_Result_Over_Time',
  dataBuilder: 'countEventsPerPeriodByDataValue',
  dataBuilderConfig: {
    periodType: 'week',
    programCode: 'SCRF',
    dataElement: 'STR_CRF169',
    isPercentage: true,
  },
  viewJson: {
    name: '% mRDT positive by result',
    type: 'chart',
    chartType: 'bar',
    chartConfig: {
      'Not done': {
        label: 'Not done',
        stackId: 1,
        legendOrder: 1,
        color: '#888888',
        valueType: 'percentage',
      },
      Negative: {
        label: 'Negative',
        stackId: 1,
        legendOrder: 2,
        color: '#8214A0',
        valueType: 'percentage',
      },
      'Positive Pf': {
        label: 'Pf positive',
        stackId: 1,
        legendOrder: 3,
        color: '#e3f2fd',
        valueType: 'percentage',
      },
      'Positive Mixed': {
        label: 'Mixed positive',
        stackId: 1,
        legendOrder: 4,
        color: '#2196f3',
        valueType: 'percentage',
      },
      'Positive Non-Pf': {
        label: 'Non Pf positive',
        stackId: 1,
        legendOrder: 5,
        color: '#bbdefb',
        valueType: 'percentage',
      },
    },
    periodGranularity: 'week',
  },
};

exports.up = async function (db) {
  await insertObject(db, 'dashboardReport', REPORT);

  return db.runSql(`
     UPDATE
       "dashboardGroup"
     SET
       "dashboardReports" = "dashboardReports" || '{ ${REPORT.id} }'
     WHERE
       "code" in (${arrayToDbString(DASHBOARD_GROUP_CODES)});
   `);
};

exports.down = function (db) {
  return db.runSql(`
     DELETE FROM "dashboardReport" WHERE id = '${REPORT.id}';
     UPDATE
       "dashboardGroup"
     SET
       "dashboardReports" = array_remove("dashboardReports", '${REPORT.id}')
     WHERE
       "code" in (${arrayToDbString(DASHBOARD_GROUP_CODES)});
   `);
};

exports._meta = {
  version: 1,
};
