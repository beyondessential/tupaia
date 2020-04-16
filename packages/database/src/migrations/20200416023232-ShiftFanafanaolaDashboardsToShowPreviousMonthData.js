'use strict';

const arrayToDbString = array => array.map(item => `'${item}'`).join(', ');

const PERIOD_GRANULARITY = 'one_month_at_a_time';
const PERIOD_TO_MOVE = -1;
const PERIOD_FORMAT = 'months';

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

exports.up = async function(db) {
  const fanafanaolaDashboardReportIds = await getOneMonthAtATimeDashboardReports(db);
  
  //Nothing to update
  if (!fanafanaolaDashboardReportIds || fanafanaolaDashboardReportIds.length === 0) {
    return;
  }

  //Add defaultTimePeriod attribute to viewJson
  await db.runSql(`
    UPDATE
      "dashboardReport"
    SET
      "viewJson" = "viewJson" || '{"defaultTimePeriod": {
        "value": ${PERIOD_TO_MOVE},
        "format": "${PERIOD_FORMAT}"
      }}'
    WHERE
      "id" IN (${arrayToDbString(fanafanaolaDashboardReportIds)});
  `);
};

exports.down = async function(db) {
  const fanafanaolaDashboardReportIds = await getOneMonthAtATimeDashboardReports(db);

  //Nothing to update
  if (!fanafanaolaDashboardReportIds || fanafanaolaDashboardReportIds.length === 0) {
    return;
  }

  //Remove `defaultTimePeriod` attribute from viewJson
  await db.runSql(`
    UPDATE
      "dashboardReport"
    SET
    "viewJson" = "viewJson" - 'defaultTimePeriod'
    WHERE
      "id" IN (${arrayToDbString(fanafanaolaDashboardReportIds)});
  `);
};

/**
 * Get the list of all the Fanafanaola Dashboard Reports Id from DashboardGroup table
 * @param {*} db 
 */
const getAllFanafanaolaDashboardReports = async (db) => {
  const { rows: fanafanaolaDashboardGroups } = await db.runSql(`
    SELECT * FROM "dashboardGroup"
    WHERE "organisationUnitCode" = 'TO'
    AND name = 'Reproductive Health';
  `);

  //Concat all the dashboardReports from all the groups
  const fanafanaolaDashboardReportIds = fanafanaolaDashboardGroups.reduce(
    (allReportIds, fanafanaolaDashboardGroup) => allReportIds.concat(fanafanaolaDashboardGroup.dashboardReports),
    [],
  );

  //Reports can be duplicated between dashboard groups, use Set to remove all the duplicated entries.
  return [...new Set(fanafanaolaDashboardReportIds)];
}

/**
 * Get the ids of all the Fanafanaola Reports that has period granularity = one_month_at_a_time
 * @param {*} db 
 */
const getOneMonthAtATimeDashboardReports = async (db) => {
  const fanafanaolaDashboardReportIds = await getAllFanafanaolaDashboardReports(db);

  //Nothing to select
  if (!fanafanaolaDashboardReportIds || fanafanaolaDashboardReportIds.length === 0) {
    return;
  }

  //Select the actual report records
  const { rows: fanafanaolaDashboardReports } = await db.runSql(`
    SELECT * FROM "dashboardReport"
    WHERE "id" IN (${arrayToDbString(fanafanaolaDashboardReportIds)});
  `);

  let oneMonthAtATimeDashboardReportIds = [];

  //Check each report and see if the period_granularity = one_month_at_a_time
  fanafanaolaDashboardReports.map(fanafanaolaDashboardReport => {
    if (fanafanaolaDashboardReport.viewJson && 
        fanafanaolaDashboardReport.viewJson.periodGranularity === PERIOD_GRANULARITY) {
        oneMonthAtATimeDashboardReportIds.push(fanafanaolaDashboardReport.id);
    }
  });

  return oneMonthAtATimeDashboardReportIds;
};

exports._meta = {
  "version": 1
};