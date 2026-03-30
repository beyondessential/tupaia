'use strict';

import { generateId, insertObject, codeToId } from '../utilities';

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
        transform: 'filter',
        where:
          "(exists($row['STRVEC_AE-IR02']) and exists($row['STRVEC_AE-IR09'])) or (exists($row['STRVEC_AN-IR02']) and exists($row['STRVEC_AN-IR09']))",
      },
      {
        transform: 'select',
        "'insecticide'":
          "exists($row['STRVEC_AE-IR02']) ? $row['STRVEC_AE-IR02'] : $row['STRVEC_AN-IR02']",
        "'mosquitoType'": "exists($row['STRVEC_AE-IR09']) ? 'Aedes IR' : 'Anopheles IR'",
        "'mortalityRate'":
          "exists($row['STRVEC_AE-IR09']) ? $row['STRVEC_AE-IR09'] : $row['STRVEC_AN-IR09']",
        '...': ['orgUnitName'],
      },
      {
        transform: 'aggregate',
        insecticide: 'group',
        orgUnitName: 'group',
        mosquitoType: 'group',
        mortalityRate: 'avg',
      },
      {
        transform: 'select',
        '$row.orgUnitName': '$row.mortalityRate',
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

const DASHBOARD_CODE = 'PG_STRIVE_PNG';
const BASE_DASHBOARD_ITEM_CODE = 'PG_Strive_Mosquito_Mortality';
const CONFIG = {
  name: 'Average Mosquito Mortality',
  type: 'matrix',
  defaultTimePeriod: {
    end: {
      unit: 'month',
      offset: 0,
    },
    start: {
      unit: 'month',
      modifier: 'start_of',
      modifierUnit: 'year',
    },
  },
  periodGranularity: 'month',
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
  const dashboardId = await codeToId(db, 'dashboard', DASHBOARD_CODE);
  const dashboardItemId = generateId();
  const permissionGroupId = await permissionGroupNameToId(db, 'STRIVE User');
  await insertObject(db, 'report', { ...REPORT, permission_group_id: permissionGroupId });
  await insertObject(db, 'dashboard_item', {
    id: dashboardItemId,
    code: BASE_DASHBOARD_ITEM_CODE,
    report_code: REPORT.code,
    legacy: false,
    config: CONFIG,
  });
  await insertObject(db, 'dashboard_relation', {
    id: generateId(),
    dashboard_id: dashboardId,
    child_id: dashboardItemId,
    entity_types: '{country}',
    project_codes: '{strive}',
    permission_groups: '{STRIVE User}',
    sort_order: 19,
  });
};

exports.down = async function (db) {
  const dashboardId = await codeToId(db, 'dashboard', DASHBOARD_CODE);
  const dashboardItemId = await codeToId(db, 'dashboard_item', BASE_DASHBOARD_ITEM_CODE);
  await db.runSql(`
   DELETE FROM "report" WHERE code = '${REPORT.code}';
   DELETE FROM "dashboard_item" WHERE code = '${BASE_DASHBOARD_ITEM_CODE}';
   DELETE FROM "dashboard_relation" WHERE dashboard_id = '${dashboardId}' and child_id = '${dashboardItemId}';
  `);
};

exports._meta = {
  version: 1,
};
