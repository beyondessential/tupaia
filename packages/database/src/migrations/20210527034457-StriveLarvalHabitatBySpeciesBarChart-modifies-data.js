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

const DASHBOARD_GROUP_CODE = 'PG_STRIVE_PNG';
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

const BASE_DASHBOARD_REPORT = id => ({
  id,
  code: 'PG_Strive_Habitat_By_Species',
  report_code: 'PG_STRIVE_Habitat_By_Species',
  legacy: false,
});

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

const DASHBOARD_ITEM_ID = generateId();

exports.up = async function (db) {
  await insertObject(db, 'dashboard_item', {
    ...BASE_DASHBOARD_REPORT(DASHBOARD_ITEM_ID),
    config: CONFIG,
  });
  const dashboardId = await codeToId(db, 'dashboard', DASHBOARD_GROUP_CODE);
  await insertObject(db, 'dashboard_relation', {
    id: generateId(),
    dashboard_id: dashboardId,
    child_id: DASHBOARD_ITEM_ID,
    entity_types: '{country}',
    project_codes: '{strive}',
    permission_groups: '{STRIVE User}',
    sort_order: 18,
  });
};

exports.down = async function (db) {
  return db.runSql(`
  DELETE FROM "dashboard_item" WHERE id = '${DASHBOARD_ITEM_ID}';
  DELETE FROM "dashboard_relation" WHERE code = '${DASHBOARD_GROUP_CODE}';
`);
};

exports._meta = {
  version: 1,
};
