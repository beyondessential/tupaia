'use strict';

import { insertObject } from '../utilities/migration';

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

const DASHBOARD_GROUP_CODE = 'AU_Covid_Country';

const REPORT = {
  id: 'COVID_AU_Daily_Cases_Each_State_Over_Time',
  dataBuilder: 'finalValuesPerDayByOrgUnit',
  dataBuilderConfig: {
    labels: {
      AU_NT: 'NT',
      AU_SA: 'SA',
      AU_UN: 'UN',
      AU_WA: 'WA',
      total: 'Total',
      AU_ACT: 'ACT',
      AU_NSW: 'NSW',
      AU_QLD: 'QLD',
      AU_TAS: 'TAS',
      AU_VIC: 'VIC',
    },
    includeTotal: 'true',
    dataElementCodes: ['dailysurvey003'],
  },
  viewJson: {
    name: 'COVID-19 New confirmed cases, daily count by State',
    type: 'chart',
    chartType: 'line',
    chartConfig: {
      ACT: {},
      NSW: {},
      NT: {},
      QLD: {},
      SA: {},
      TAS: {},
      VIC: {},
      WA: {},
      Total: {},
    },
    description: 'Confirmed cases reported each day for each State and Territory',
    periodGranularity: 'day',
  },
};

exports.up = async function(db) {
  await insertObject(db, 'dashboardReport', REPORT);

  return db.runSql(`
    UPDATE
      "dashboardGroup"
    SET
      "dashboardReports" = "dashboardReports" || '{ ${REPORT.id} }'
    WHERE
      "code" = '${DASHBOARD_GROUP_CODE}';
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
      "code" = '${DASHBOARD_GROUP_CODE}';
  `);
};

exports._meta = {
  version: 1,
};
