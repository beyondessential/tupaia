'use strict';

import { generateId, insertObject, arrayToDbString } from '../utilities';

var dbm;
var type;
var seed;

const permissionGroupNameToId = async (db, name) => {
  const record = await db.runSql(`SELECT id FROM permission_group WHERE name = '${name}'`);
  return record.rows[0] && record.rows[0].id;
};

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

const REPORT = {
  id: generateId(),
  code: 'PG_Strive_PNG_Lab_Confirmed_Positive_Results',
  config: {
    fetch: {
      dataElements: ['STR_QMAL05', 'STR_PF05', 'STR_PV05', 'STR_PM05', 'STR_PO05'],
      aggregations: [
        {
          type: 'REPLACE_ORG_UNIT_WITH_ORG_GROUP',
          config: { aggregationEntityType: 'requested', dataSourceEntityType: 'case' },
        },
      ],
    },
    transform: [
      {
        transform: 'filter',
        where: '$row.value == 1', // 0 indicates negative response, we are only interested in positive responses
      },
      'keyValueByDataElementName',
      'convertPeriodToWeek',
      {
        transform: 'aggregate',
        organisationUnit: 'drop',
        period: 'group',
        '...': 'count',
      },
      {
        transform: 'select',
        "'name'": "periodToDisplayString($row.period, 'WEEK')",
        "'timestamp'": 'periodToTimestamp($row.period)',
        "'Pf+ve'": 'divide($row.STR_PF05,$row.STR_QMAL05)',
        "'Pv+ve'": 'divide($row.STR_PV05,$row.STR_QMAL05)',
        "'PM+ve'": 'divide($row.STR_PM05,$row.STR_QMAL05)',
        "'PO+ve'": 'divide($row.STR_PO05,$row.STR_QMAL05)',
      },
    ],
  },
};

const getReport = permissionGroupId => ({ ...REPORT, permission_group_id: permissionGroupId });

const DASHBOARD_GROUP_CODE = 'PG_Strive_PNG_Facility';

const DASHBOARD_REPORT = {
  id: 'PG_Strive_PNG_Lab_Confirmed_Positive_Results_Stacked_Bar_Chart',
  dataBuilder: 'reportServer',
  dataBuilderConfig: {
    reportCode: REPORT.code,
  },
  viewJson: {
    name: 'Lab Confirmed Positive Results, Bar Graph',
    type: 'chart',
    chartType: 'bar',
    chartConfig: {
      'Pf+ve': { stackId: 1 },
      'Pv+ve': { stackId: 1 },
      'PM+ve': { stackId: 1 },
      'PO+ve': { stackId: 1 },
    },
    periodGranularity: 'week',
    valueType: 'percentage',
    presentationOptions: {
      hideAverage: true,
    },
  },
};

exports.up = async function (db) {
  const permissionGroupId = await permissionGroupNameToId(db, 'STRIVE User');
  const report = getReport(permissionGroupId);
  await insertObject(db, 'report', report);

  await insertObject(db, 'dashboardReport', DASHBOARD_REPORT);

  await db.runSql(`
    UPDATE
      "dashboardGroup"
    SET
      "dashboardReports" = "dashboardReports" || '{ ${DASHBOARD_REPORT.id} }'
    WHERE
      "code" = '${DASHBOARD_GROUP_CODE}';
  `);
};

exports.down = async function (db) {
  await db.runSql(`
    DELETE FROM report
    WHERE code = '${REPORT.code}';
  `);

  await db.runSql(`
    DELETE FROM "dashboardReport" WHERE id = '${DASHBOARD_REPORT.id}';

    UPDATE
      "dashboardGroup"
    SET
      "dashboardReports" = array_remove("dashboardReports", '${DASHBOARD_REPORT.id}')
    WHERE
      "code" = '${DASHBOARD_GROUP_CODE}';
  `);
};

exports._meta = {
  version: 1,
};
