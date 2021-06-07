'use strict';

import { insertObject, generateId } from '../utilities';

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

const DASHBOARD_GROUP_CODE = 'PG_Strive_PNG_Country';

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

const BASE_DASHBOARD_REPORT = {
  id: 'PG_Strive_Habitat_By_Species',
  dataBuilder: 'reportServer',
  dataServices: [
    {
      isDataRegional: true,
    },
  ],
};

const DATA_BUILDER_CONFIG = {
  reportCode: 'PG_STRIVE_Habitat_By_Species',
};

const getChartConfig = () => {
  const chartConfig = {};
  SPECIES.forEach((species, index) => {
    chartConfig[species] = { color: COLOURS[index], stackId: 1, legendOrder: index + 1 };
  });
  return chartConfig;
};

const VIEW_JSON = {
  name: 'Larval Habitat by Species',
  type: 'chart',
  chartType: 'bar',
  chartConfig: getChartConfig(),
};

exports.up = async function (db) {
  await insertObject(db, 'dashboardReport', {
    ...BASE_DASHBOARD_REPORT,
    dataBuilderConfig: DATA_BUILDER_CONFIG,
    viewJson: VIEW_JSON,
  });

  return db.runSql(`
    UPDATE
      "dashboardGroup"
    SET
      "dashboardReports" = "dashboardReports" || '{ ${BASE_DASHBOARD_REPORT.id} }'
    WHERE
      "code" = '${DASHBOARD_GROUP_CODE}';
  `);
};

exports.down = async function (db) {
  return db.runSql(`
  DELETE FROM "dashboardReport" WHERE id = '${BASE_DASHBOARD_REPORT.id}';
  UPDATE
    "dashboardGroup"
  SET
    "dashboardReports" = array_remove("dashboardReports", '${BASE_DASHBOARD_REPORT.id}')
  WHERE
    "code" = '${DASHBOARD_GROUP_CODE}';
`);
};

exports._meta = {
  version: 1,
};
