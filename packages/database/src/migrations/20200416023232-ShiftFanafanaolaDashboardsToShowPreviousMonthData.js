'use strict';

const arrayToDbString = array => array.map(item => `'${item}'`).join(', ');

const PERIOD_GRANULARITY = 'one_month_at_a_time';
const PERIOD_TO_MOVE = -1;
const PERIOD_FORMAT = 'months';
const HEALTH_SECTIONS_TO_UPDATE = [
  'Reproductive Health Validation',
  'Community Health Validation',
  'Communicable Diseases Validation',
  'Health Promotion Unit Validation',
  'Reproductive Health',
  'Community Health',
];

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

exports.up = async function (db) {
  // Add defaultTimePeriod attribute to viewJson
  await db.runSql(`
    UPDATE
      "dashboardReport"
    SET
      "viewJson" = "viewJson" || '{"defaultTimePeriod": {
        "value": ${PERIOD_TO_MOVE},
        "format": "${PERIOD_FORMAT}"
      }}'
    WHERE
      "id" IN (${ONE_MONTH_A_TIME_FANAFANAOLA_DASH_REPORTS_SQL});
  `);
};

exports.down = async function (db) {
  // Remove `defaultTimePeriod` attribute from viewJson
  await db.runSql(`
    UPDATE
      "dashboardReport"
    SET
      "viewJson" = "viewJson" - 'defaultTimePeriod'
    WHERE
      "id" IN (${ONE_MONTH_A_TIME_FANAFANAOLA_DASH_REPORTS_SQL});
  `);
};

// Select Statement to select all the Fanafanaola dashboard reports that have period_granularity = 'one_month_at_a_time'
const ONE_MONTH_A_TIME_FANAFANAOLA_DASH_REPORTS_SQL = `SELECT DISTINCT "dashboardReport".id
FROM "dashboardReport"
INNER JOIN "dashboardGroup"
ON "dashboardGroup"."organisationUnitCode" = 'TO'
AND "dashboardGroup".name IN (${arrayToDbString(HEALTH_SECTIONS_TO_UPDATE)})
AND "dashboardReport".id = ANY("dashboardGroup"."dashboardReports")
AND "dashboardReport"."drillDownLevel" IS NULL
AND "dashboardReport"."viewJson" @> '{"periodGranularity": "${PERIOD_GRANULARITY}"}'`;

exports._meta = {
  version: 1,
};
