'use strict';

import { insertObject, generateId, codeToId } from '../utilities';

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

const SPECIES = [
  'Ae. aegypti',
  'Ae. albopictus',
  'Ae. scutellaris',
  'Aedes Other',
  'Aedes spp.',
  'An. farauti',
  'An. koliensis',
  'An. longirostris',
  'An. punctulatus',
  'Culex spp.',
  'Cx. annulirostris',
  'Cx. quinquefasciatus',
  'Cx. sitiens',
  'Mansoni spp.',
];

const COLOURS = [
  '#e22709',
  '#0df3e4',
  '#fa6131',
  '#9bbf87',
  '#3fc399',
  '#28d530',
  '#4549a6',
  '#c3d146',
  '#67a6d1',
  '#4e9469',
  '#e617d4',
  '#d84876',
  '#4744cb',
  '#b89fbd',
];

const getChartConfig = () => {
  const chartConfig = {};
  SPECIES.forEach((species, index) => {
    chartConfig[species] = { color: COLOURS[index], stackId: 1, legendOrder: index + 1 };
  });
  return chartConfig;
};

const CONFIG = {
  name: 'Larval Habitat by Species',
  type: 'chart',
  chartType: 'bar',
  chartConfig: getChartConfig(),
};

const DASHBOARD_ITEM_CODE = 'PG_Strive_Habitat_By_Species';
const DASHBOARD_CODE = 'PG_STRIVE_PNG';

exports.up = async function (db) {
  const dashboardItemId = generateId();
  const dashboardId = await codeToId(db, 'dashboard', DASHBOARD_CODE);

  await insertObject(db, 'dashboard_item', {
    id: dashboardItemId,
    code: DASHBOARD_ITEM_CODE,
    report_code: 'PG_STRIVE_Habitat_By_Species',
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
    sort_order: 18,
  });
};

exports.down = async function (db) {
  const dashboardItemId = await codeToId(db, 'dashboard_item', DASHBOARD_ITEM_CODE);
  const dashboardId = await codeToId(db, 'dashboard', DASHBOARD_CODE);
  return db.runSql(`
    DELETE FROM "dashboard_item" WHERE code = '${DASHBOARD_ITEM_CODE}';
    DELETE FROM "dashboard_relation" WHERE dashboard_id = '${dashboardId}' and child_id = '${dashboardItemId}';
  `);
};

exports._meta = {
  version: 1,
};
