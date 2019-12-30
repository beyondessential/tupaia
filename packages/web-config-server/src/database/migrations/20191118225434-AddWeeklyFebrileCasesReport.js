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
  id: 'PG_Strive_PNG_Weekly_Number_of_Febrile_Cases',
  name: 'Weekly Number of Febrile Cases',
  periodGranularity: 'week',
  periodType: 'week',
  programCode: 'SCRF',
};
const DATA_VALUES = {
  hasFever: { STR_CRF125: '1' },
  mrdtPositive: { STR_CRF169: { operator: 'regex', value: 'Positive' } },
  mrdtDone: { STR_CRF165: '1' },
};
const DASHBOARD_GROUP_CODES = ['PG_Strive_PNG_Facility'];

exports.up = async function(db) {
  await insertObject(db, 'dashboardReport', {
    id: REPORT.id,
    dataBuilder: 'composeDataPerPeriod',
    dataBuilderConfig: {
      dataBuilders: {
        febrile: {
          dataBuilder: 'countEventsPerPeriod',
          dataBuilderConfig: {
            programCode: REPORT.programCode,
            dataValues: DATA_VALUES.hasFever,
            periodType: REPORT.periodType,
          },
        },
        mRDT: {
          dataBuilder: 'percentagesOfEventCountsPerPeriod',
          dataBuilderConfig: {
            programCode: REPORT.programCode,
            periodType: REPORT.periodType,
            dataClasses: {
              mRDT: {
                numerator: { dataValues: DATA_VALUES.mrdtPositive },
                denominator: { dataValues: DATA_VALUES.mrdtDone },
              },
            },
          },
        },
      },
    },
    viewJson: {
      name: REPORT.name,
      type: 'chart',
      chartType: 'composed',
      chartConfig: {
        febrile: {
          chartType: 'bar',
          label: 'Febrile Illness Case Count',
        },
        mRDT: {
          chartType: 'line',
          valueType: 'percentage',
          yAxisOrientation: 'right',
          label: '% of mRDT positive cases',
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
