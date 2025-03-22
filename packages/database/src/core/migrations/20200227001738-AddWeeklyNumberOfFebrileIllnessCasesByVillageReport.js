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

const DASHBOARD_GROUP_CODE = 'PG_Strive_PNG_Facility';
const REPORT = {
  id: 'PG_Strive_PNG_Weekly_Febrile_Cases_By_Village',
  dataBuilder: 'countEvents',
  dataBuilderConfig: {
    programCode: 'SCRF',
    groupBy: {
      type: 'allOrgUnitNames',
      options: { parentCode: '{organisationUnitCode}', type: 'village' },
    },
  },
  viewJson: {
    name: 'Weekly Number of Febrile Illness Cases by Village',
    type: 'chart',
    chartType: 'bar',
    periodGranularity: 'one_week_at_a_time',
    presentationOptions: { hideAverage: true },
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
