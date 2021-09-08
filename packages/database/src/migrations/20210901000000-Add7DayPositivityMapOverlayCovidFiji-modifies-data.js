'use strict';

import {
  insertObject,
  generateId,
  codeToId,
  arrayToDbString,
  findSingleRecord,
  findSingleRecordBySql,
} from '../utilities';

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

const getFrontEndConfig = () => ({
  scaleType: 'performanceDesc',
  valueType: 'percentage',
  displayType: 'shaded-spectrum',
  customLabel: '% Positivity rate',
  scaleBounds: {
    left: {
      max: 0,
      min: 0,
    },
  },
  measureLevel: 'District',
  hideByDefault: {
    null: true,
  },
});

const getReportConfig = () => ({
  fetch: {
    aggregations: [
      {
        type: 'SUM_PER_PERIOD_PER_ORG_GROUP',
        config: {
          dataSourceEntityType: 'facility',
          aggregationEntityType: 'district',
        },
      },
    ],
    dataElements: ['COVID_FJ_7_Day_Rolling_Pos_Tests', 'COVID_FJ_7_Day_Rolling_Num_Tests'],
  },
  transform: [
    'keyValueByDataElementName',
    {
      transform: 'select',
      "'Pos_Tests'": '$row.COVID_FJ_7_Day_Rolling_Pos_Tests',
      "'Num_Tests'": '$row.COVID_FJ_7_Day_Rolling_Num_Tests',
      '...': ['period', 'organisationUnit'],
    },
    {
      transform: 'aggregate',
      period: 'drop',
      organisationUnit: 'group',
      Num_Tests: 'sum',
      Pos_Tests: 'sum',
    },
    {
      transform: 'filter',
      where: 'exists($row.Num_Tests) and $row.Num_Tests > 0 and exists($row.Pos_Tests)',
    },
    {
      "'value'": 'divide($row.Num_Tests,$row.Pos_Tests)',
      transform: 'select',
      "'Positive tests'": '$row.Pos_Tests',
      "'organisationUnitCode'": '$row.organisationUnit',
      "'Total tests'": '$row.Num_Tests',
    },
  ],
});

const getConfig = () => ({
  code: 'FJ_Covid_7_Day_Positivity_Rate_Overlay_Division',
  name: '7 day % positivity rate (Division)',
  frontEndConfig: getFrontEndConfig(),
  reportConfig: getReportConfig(),
  userGroup: 'BES Admin',
  mapOverlayGroupCode: 'COVID-19_Testing_Fiji',
  countryCodes: ['FJ'],
  projectCodes: ['supplychain_fiji'],
});

const addMapOverlayAndReport = async (
  db,
  {
    code,
    name,
    frontEndConfig,
    reportConfig,
    userGroup,
    mapOverlayGroupCode,
    countryCodes,
    projectCodes,
  },
) => {
  // insert report
  const reportId = generateId();
  const permissionGroupId = (await findSingleRecord(db, 'permission_group', { name: userGroup }))
    .id;
  await insertObject(db, 'report', {
    id: reportId,
    code,
    config: reportConfig,
    permission_group_id: permissionGroupId,
  });

  // insert map overlay
  await insertObject(db, 'mapOverlay', {
    id: code,
    name,
    dataElementCode: 'value',
    measureBuilderConfig: {
      reportCode: code,
      dataSourceType: 'custom',
    },
    measureBuilder: 'useReportServer',
    presentationOptions: frontEndConfig,
    isDataRegional: true,
    userGroup,
    countryCodes: `{${countryCodes.join(', ')}}`,
    projectCodes: `{${projectCodes.join(', ')}}`,
  });

  // insert relation record connecting dashboard item to dashboard
  await addMapOverlayToOverlayGroup(db, { code, mapOverlayGroupCode });
};

const addMapOverlayToOverlayGroup = async (db, { code, mapOverlayGroupCode }) => {
  const mapOverlayGroupId = (
    await findSingleRecord(db, 'map_overlay_group', { code: mapOverlayGroupCode })
  ).id;
  const maxSortOrder = (
    await findSingleRecordBySql(
      db,
      `SELECT max(sort_order) as max_sort_order FROM map_overlay_group_relation WHERE map_overlay_group_id = '${mapOverlayGroupId}';`,
    )
  ).max_sort_order;

  await insertObject(db, 'map_overlay_group_relation', {
    id: generateId(),
    map_overlay_group_id: mapOverlayGroupId,
    child_id: code,
    child_type: 'mapOverlay',
    sort_order: maxSortOrder + 1,
  });
};

const insertMapOverlayGroup = async (db, { name, code }) => {
  const mapOverlayGroupId = generateId();

  await insertObject(db, 'map_overlay_group', {
    id: mapOverlayGroupId,
    name,
    code,
  });

  const rootOverlayGroupId = await codeToId(db, 'map_overlay_group', 'Root');
  await insertObject(db, 'map_overlay_group_relation', {
    id: generateId(),
    map_overlay_group_id: rootOverlayGroupId,
    child_id: mapOverlayGroupId,
    child_type: 'mapOverlayGroup',
  });
  console.log('he');
};

const removeMapOverlayGroup = async (db, code) => {
  const overlayGroupId = await codeToId(db, 'map_overlay_group', code);
  await db.runSql(`DELETE FROM "map_overlay_group_relation" WHERE child_id = '${overlayGroupId}';`);
  await db.runSql(`DELETE FROM "map_overlay_group" WHERE code = '${code}';`);
};

const removeMapOverlayAndReport = async (db, code) => {
  await db.runSql(`DELETE FROM "map_overlay_group_relation" WHERE child_id = '${code}';`);
  await db.runSql(`DELETE FROM "mapOverlay" WHERE id = '${code}';`);
  await db.runSql(`DELETE FROM report WHERE code = '${code}';`);
};

exports.up = async function (db) {
  const overlay = getConfig();

  await insertMapOverlayGroup(db, {
    name: 'COVID-19 Testing',
    code: 'COVID-19_Testing_Fiji',
  });

  await addMapOverlayAndReport(db, overlay);
};

exports.down = async function (db) {
  const { code } = getConfig();

  await removeMapOverlayAndReport(db, code);
  await removeMapOverlayGroup(db, 'COVID-19_Testing_Fiji');
};
