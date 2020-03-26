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
    includeTotal: 'true',
    dataElementCodes: ['dailysurvey003'],
  },
  viewJson: {
    name: 'COVID-19 New confirmed cases, daily count by State',
    type: 'chart',
    chartType: 'line',
    chartConfig: {
      AU_ACT: { label: 'ACT' },
      AU_NSW: { label: 'NSW' },
      AU_NT: { label: 'NT' },
      AU_QLD: { label: 'QLD' },
      AU_SA: { label: 'SA' },
      AU_TAS: { label: 'TAS' },
      AU_VIC: { label: 'VIC' },
      AU_WA: { label: 'WA' },
      total: { label: 'Total' },
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
