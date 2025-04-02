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

const DASHBOARD_GROUP_CODES = ['TO_Health_Promotion_Unit_Country'];

const REPORT_ID = 'TO_HPU_IEC_Requests_Fulfilled_By_Target_Group';

const DATA_BUILDER_CONFIG = {
  programCode: 'HP05',
  dataElement: 'HP242',
  periodType: 'month',
};

const VIEW_JSON = {
  name: 'IEC requests fulfilled (by target group)',
  type: 'chart',
  chartType: 'bar',
  chartConfig: {
    'Diabetic Patients': {
      label: 'Diabetic Patients',
      stackId: 1,
      legendOrder: 1,
    },
    'Pregnant Women': {
      label: 'Pregnant Women',
      stackId: 1,
      legendOrder: 2,
    },
    Smokers: {
      label: 'Smokers',
      stackId: 1,
      legendOrder: 3,
    },
    'Youth and Adult': {
      label: 'Youth and Adult',
      stackId: 1,
      legendOrder: 4,
    },
    'Visitors to Health Centres': {
      label: 'Visitors to Health Centres',
      stackId: 1,
      legendOrder: 5,
    },
    Other: {
      label: 'Other',
      stackId: 1,
      legendOrder: 6,
    },
  },
  periodGranularity: 'month',
};

const DATA_SERVICES = [
  {
    isDataRegional: false,
  },
];

const REPORT = {
  id: REPORT_ID,
  dataBuilder: 'countEventsPerPeriodByDataValue',
  dataBuilderConfig: DATA_BUILDER_CONFIG,
  viewJson: VIEW_JSON,
  dataServices: DATA_SERVICES,
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
