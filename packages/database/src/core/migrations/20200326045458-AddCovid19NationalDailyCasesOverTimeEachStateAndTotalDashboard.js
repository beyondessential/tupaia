'use strict';

import { insertObject } from '../utilities/migration';

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

const DASHBOARD_GROUP_CODE = 'AU_Covid_Country';

const REPORT = {
  id: 'COVID_AU_Total_Cases_Each_State_Per_Day',
  dataBuilder: 'sumPreviousValuesPerDayByOrgUnit',
  dataBuilderConfig: {
    includeTotal: 'true',
    dataElementCodes: ['dailysurvey003'],
  },
  viewJson: {
    name: 'COVID-19 Total confirmed cases, daily count by State',
    type: 'chart',
    chartType: 'line',
    chartConfig: {
      'AU_Australian Capital Territory': { legendOrder: 0, label: 'ACT' },
      'AU_New South Wales': { legendOrder: 1, label: 'NSW' },
      'AU_Northern Territory': { legendOrder: 2, label: 'NT' },
      AU_Queensland: { legendOrder: 3, label: 'QLD' },
      'AU_South Australia': { legendOrder: 4, label: 'SA' },
      AU_Tasmania: { legendOrder: 5, label: 'TAS' },
      AU_Victoria: { legendOrder: 6, label: 'VIC' },
      'AU_Western Australia': { legendOrder: 7, label: 'WA' },
      total: { legendOrder: 8, label: 'Total' },
    },
    description: 'Total confirmed cases each day for each State and Territory',
    periodGranularity: 'day',
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
      "code" = '${DASHBOARD_GROUP_CODE}';
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
      "code" = '${DASHBOARD_GROUP_CODE}';
  `);
};

exports._meta = {
  version: 1,
};
