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

const DASHBOARD_GROUP_CODES = ['Tonga_Communicable_Diseases_National'];

const REPORT = {
  id: 'TO_CD_Lab_Confirmed_STIs_Stacked_Bar',
  dataBuilder: 'composeDataPerPeriod',
  dataBuilderConfig: {
    dataBuilders: {
      Chlamydia: {
        dataBuilder: 'countEventsPerPeriod',
        dataBuilderConfig: {
          dataValues: {
            CD2_12_A74_9: 'Lab Confirmed',
          },
          periodType: 'month',
          programCode: 'CD2',
        },
      },
      Gonorrhea: {
        dataBuilder: 'countEventsPerPeriod',
        dataBuilderConfig: {
          dataValues: {
            CD2_17_A54_9: 'Lab Confirmed',
          },
          periodType: 'month',
          programCode: 'CD2',
        },
      },
      Syphilis: {
        dataBuilder: 'countEventsPerPeriod',
        dataBuilderConfig: {
          dataValues: {
            CD2_29_A53_9: 'Lab Confirmed (blood)',
          },
          periodType: 'month',
          programCode: 'CD2',
        },
      },
      'Hep B': {
        dataBuilder: 'countEventsPerPeriod',
        dataBuilderConfig: {
          dataValues: {
            CD2_NEW007_B16_9: 'Detected',
          },
          periodType: 'month',
          programCode: 'CD2',
        },
      },
    },
  },
  viewJson: {
    name: 'New lab confirmed STI cases per month (excluding HIV)',
    type: 'chart',
    chartType: 'bar',
    periodGranularity: 'month',
    chartConfig: {
      Chlamydia: {
        stackId: 1,
      },
      Gonorrhea: {
        stackId: 1,
      },
      Syphilis: {
        stackId: 1,
      },
      'Hep B': {
        stackId: 1,
      },
    },
  },
  dataServices: [
    {
      isDataRegional: false,
    },
  ],
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
