'use strict';

import { generateId, insertObject, arrayToDbString } from '../utilities';

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

const permissionGroupNameToId = async (db, name) => {
  const record = await db.runSql(`SELECT id FROM permission_group WHERE name = '${name}'`);
  return record.rows[0] && record.rows[0].id;
};

const REPORT = {
  id: generateId(),
  code: 'AU_Flutracking_First_Nation_With_ILI',
  config: {
    fetch: {
      aggregations: [
        {
          type: 'RAW',
          config: {
            dataSourceEntityType: 'facility',
          },
        },
      ],
      dataElements: ['FluTracker_LGA_Percent_First_Nations_ILI'],
    },
    transform: [],
    output: {},
  },
};

const DASHBOARD_GROUP_CODES = ['AU_Covid_Country'];

const BASE_DASHBOARD_REPORT = {
  id: 'AU_Flutracking_First_Nation_With_ILI_Line_Graph',
  dataBuilder: 'reportServer',
  dataServices: [
    {
      isDataRegional: true,
    },
  ],
  dataBuilderConfig: { reportCode: REPORT.code },
};

const VIEW_JSON = {
  name: 'Influenza-Like Illness (ILI) activity among First Nation participants',
  type: 'chart',
  chartType: 'line',
  presentationOptions: {
    periodTickFormat: 'MMM',
  },
};

exports.up = async function (db) {
  const permissionGroupId = await permissionGroupNameToId(db, 'Public');
  await insertObject(db, 'report', { ...REPORT, permission_group_id: permissionGroupId });
  await insertObject(db, 'dashboardReport', {
    ...BASE_DASHBOARD_REPORT,
    viewJson: VIEW_JSON,
  });
  await db.runSql(`
    UPDATE
      "dashboardGroup"
    SET
      "dashboardReports" = "dashboardReports" || '{ ${BASE_DASHBOARD_REPORT.id} }'
    WHERE
      "code" in (${arrayToDbString(DASHBOARD_GROUP_CODES)});
  `);
};

exports.down = async function (db) {
  await db.runSql(`
   DELETE FROM "report" WHERE code = '${REPORT.code}';
   DELETE FROM "dashboardReport" WHERE id = '${BASE_DASHBOARD_REPORT.id}';
   UPDATE
     "dashboardGroup"
   SET
     "dashboardReports" = array_remove("dashboardReports", '${BASE_DASHBOARD_REPORT.id}')
   WHERE
   "code" in (${arrayToDbString(DASHBOARD_GROUP_CODES)});
  `);
};

exports._meta = {
  version: 1,
};
