'use strict';

import { insertObject } from '../migrationUtilities';

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
  id: 'PG_Strive_PNG_Weekly_Reported_Cases',
  name: 'Weekly Reported Cases',
  isDataRegional: true,
  periodGranularity: 'one_week_at_a_time',
  programCode: 'SCRF',
};
const DASHBOARD_GROUP_CODES = ['PG_Strive_PNG'];

const arrayToDbString = array => array.map(item => `'${item}'`).join(', ');

exports.up = async function(db) {
  await insertObject(db, 'dashboardReport', {
    id: REPORT.id,
    dataBuilder: 'countEvents',
    dataBuilderConfig: {
      programCode: REPORT.programCode,
    },
    viewJson: {
      name: REPORT.name,
      type: 'view',
      viewType: 'singleValue',
      periodGranularity: REPORT.periodGranularity,
    },
    dataServices: [{ isDataRegional: REPORT.isDataRegional }],
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
