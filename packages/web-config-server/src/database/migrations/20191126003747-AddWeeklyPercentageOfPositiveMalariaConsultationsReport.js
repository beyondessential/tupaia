'use strict';

import { insertObject, arrayToDbString } from '../migrationUtilities';

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

const REPORT = {
  id: 'PG_Strive_PNG_Weekly_Percentage_of_Positive_Consultations',
  name: 'Weekly % of Positive Malaria Consultations',
  periodGranularity: 'one_week_at_a_time',
};
const DASHBOARD_GROUP_CODES = ['PG_Strive_PNG_Facility'];
const DATA_BUILDERS = {
  mrdtPositive: {
    dataBuilder: 'countEventsPerPeriod',
    dataBuilderConfig: {
      programCode: 'SCRF',
      dataValues: {
        STR_CRF169: { operator: 'regex', value: 'Positive' },
      },
      periodType: 'week',
    },
  },
  consultations: {
    dataBuilder: 'sumPerWeek',
    dataBuilderConfig: {
      dataSource: { type: 'single', codes: ['SSWT1001'] },
    },
  },
};

exports.up = async function(db) {
  await insertObject(db, 'dashboardReport', {
    id: REPORT.id,
    dataBuilder: 'composePercentagesPerPeriod',
    dataBuilderConfig: {
      dataBuilders: {
        mrdtPositive: DATA_BUILDERS.mrdtPositive,
        consultations: DATA_BUILDERS.consultations,
      },
      percentages: {
        value: {
          numerator: 'mrdtPositive',
          denominator: 'consultations',
        },
      },
    },
    viewJson: {
      name: REPORT.name,
      type: 'view',
      viewType: 'singleValue',
      valueType: 'percentage',
      periodGranularity: REPORT.periodGranularity,
    },
  });

  return db.runSql(`
    UPDATE
      "dashboardGroup"
    SET
      "dashboardReports" = "dashboardReports" || '{ ${REPORT.id} }'
    WHERE
      "code" IN (${arrayToDbString(DASHBOARD_GROUP_CODES)});
`);
};

exports.down = function(db) {
  return db.runSql(`
    DELETE FROM "dashboardReport" WHERE id = '${REPORT.id}';
  
    UPDATE
      "dashboardGroup"
    SET
      "dashboardReports" = array_remove("dashboardReports", '${REPORT.id}')
    WHERE
      "code" IN (${arrayToDbString(DASHBOARD_GROUP_CODES)});
  `);
};

exports._meta = {
  version: 1,
};
