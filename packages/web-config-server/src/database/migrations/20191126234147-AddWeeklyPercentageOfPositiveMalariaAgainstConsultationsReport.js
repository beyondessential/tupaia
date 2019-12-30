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
  id: 'PG_Strive_PNG_Weekly_Percentage_of_Positive_Malaria_Against_Consultations',
  name: 'Weekly % of positive malaria (+ve RDT) cases against consultation (all cause)',
  periodGranularity: 'week',
};
const consultationCount = {
  dataBuilder: 'sumPerWeek',
  dataBuilderConfig: {
    dataSource: { type: 'single', codes: ['SSWT1001'] },
  },
};
const positiveCount = {
  dataBuilder: 'countEventsPerPeriod',
  dataBuilderConfig: {
    programCode: 'SCRF',
    dataValues: {
      STR_CRF169: { operator: 'regex', value: 'Positive' },
    },
    periodType: 'week',
  },
};
const DATA_BUILDERS = {
  positive: {
    dataBuilder: 'composePercentagesPerPeriod',
    dataBuilderConfig: {
      dataBuilders: {
        positiveCount,
        consultationCount,
      },
      percentages: {
        value: {
          numerator: 'positiveCount',
          denominator: 'consultationCount',
        },
      },
    },
  },
  consultations: consultationCount,
};
const DASHBOARD_GROUP_CODES = ['PG_Strive_PNG_Facility'];

exports.up = async function(db) {
  await insertObject(db, 'dashboardReport', {
    id: REPORT.id,
    dataBuilder: 'composeDataPerPeriod',
    dataBuilderConfig: {
      dataBuilders: {
        positive: DATA_BUILDERS.positive,
        consultations: DATA_BUILDERS.consultations,
      },
    },
    viewJson: {
      name: REPORT.name,
      type: 'chart',
      chartType: 'composed',
      chartConfig: {
        positive: {
          chartType: 'line',
          valueType: 'percentage',
          yAxisOrientation: 'right',
          label: '% of positive malaria (+ve RDT)',
        },
        consultations: {
          chartType: 'bar',
          label: 'Number of consultations (all causes)',
        },
      },
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
