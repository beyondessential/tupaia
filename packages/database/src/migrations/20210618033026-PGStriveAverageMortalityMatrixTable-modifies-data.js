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
  code: 'PG_Strive_Mosquito_Mortality',
  config: {
    fetch: {
      dataGroups: ['STRVEC_AE-IR', 'STRVEC_AN-IR'],
      aggregations: [
        {
          type: 'RAW',
          config: {
            dataSourceEntityType: 'facility',
          },
        },
      ],
      dataElements: ['STRVEC_AE-IR09', 'STRVEC_AE-IR02', 'STRVEC_AN-IR09', 'STRVEC_AN-IR02'],
    },
    output: {
      type: 'matrix',
      rowField: 'insecticide',
      columns: '*',
      categoryField: 'mosquitoType',
    },
    transform: [
      {
        '...': ['STRVEC_AE-IR09', 'STRVEC_AN-IR09', 'orgUnitName'],
        transform: 'select',
        "'insecticide'":
          "exists($row['STRVEC_AE-IR02']) ? $row['STRVEC_AE-IR02'] : $row['STRVEC_AN-IR02']",
        "'mosquitoType'": "exists($row['STRVEC_AE-IR09']) ? 'Aedes IR' : 'Anopheles IR'",
      },
      {
        transform: 'aggregate',
        insecticide: 'group',
        orgUnitName: 'group',
        mosquitoType: 'group',
        'STRVEC_AE-IR09': 'avg',
        'STRVEC_AN-IR09': 'avg',
      },
      {
        transform: 'select',
        '$row.orgUnitName':
          "exists($row['STRVEC_AE-IR09']) ? $row['STRVEC_AE-IR09'] : $row['STRVEC_AN-IR09']",
        '...': ['insecticide', 'mosquitoType'],
      },
      {
        transform: 'aggregate',
        insecticide: 'group',
        mosquitoType: 'group',
        '...': 'last',
      },
    ],
  },
};

const DASHBOARD_GROUP_CODES = ['PG_Strive_PNG_Country'];

const BASE_DASHBOARD_REPORT = {
  id: 'PG_Strive_Mosquito_Mortality',
  dataBuilder: 'reportServer',
  dataServices: [
    {
      isDataRegional: true,
    },
  ],
  dataBuilderConfig: { reportCode: REPORT.code },
};

const VIEW_JSON = {
  name: 'Average Mosquito Mortality',
  type: 'matrix',
  periodGranularity: 'one_month_at_a_time',
  presentationOptions: {
    type: 'condition',
    conditions: [
      {
        key: 'red',
        color: '#b71c1c',
        description: 'Average: ',
        condition: {
          '<': 90,
          '>': 0,
        },
        legendLabel: '<90: Confirmed resistance',
      },
      {
        key: 'orange',
        color: '#FF8000',
        description: 'Average: ',
        condition: {
          '>=': 90,
          '<=': 97,
        },
        legendLabel: '90-97: Possible resistance',
      },
      {
        key: 'green',
        color: '#33691e',
        condition: {
          '>': 97,
        },
        description: 'Average: ',
        legendLabel: '>97: Susceptible',
      },
    ],
    showRawValue: true,
  },
};

exports.up = async function (db) {
  const permissionGroupId = await permissionGroupNameToId(db, 'STRIVE User');
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
