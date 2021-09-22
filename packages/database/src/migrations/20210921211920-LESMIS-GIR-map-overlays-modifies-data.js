'use strict';

import { generateId, insertObject, codeToId, nameToId } from '../utilities';

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

const MAP_OVERLAY_GROUP = {
  id: generateId(),
  name: 'Gross Intake Rate Grade 5',
  code: 'Gross_Intake_Rate_Grade_5',
};

const DISTRICT_OVERLAY_GROUP = {
  id: generateId(),
  name: 'District Level',
  code: 'LESMIS_GIR_GRADE_5_DISTRICT_LEVEL_GROUP',
};

const PROVINCE_OVERLAY_GROUP = {
  id: generateId(),
  name: 'Province Level',
  code: 'LESMIS_GIR_GRADE_5_PROVINCE_LEVEL_GROUP',
};

const getStandardReport = (reportCode, dataElements) => ({
  id: generateId(),
  code: reportCode,
  config: {
    fetch: {
      dataElements,
      aggregations: [
        {
          type: 'FINAL_EACH_YEAR',
          config: {
            dataSourceEntityType: reportCode.includes('PROVINCE') ? 'district' : 'sub_district',
            aggregationEntityType: 'requested',
          },
        },
      ],
    },
    transform: [
      {
        transform: 'updateColumns',
        insert: {
          organisationUnitCode: '=$organisationUnit',
          value: '=divide($value, 100)',
        },
        exclude: ['organisationUnit', 'dataElement', 'period'],
      },
    ],
  },
});

const getPriorityDistrictsReport = (reportCode, dataElements) => ({
  id: generateId(),
  code: reportCode,
  config: {
    fetch: {
      dataElements,
      aggregations: [
        {
          type: 'COUNT_PER_PERIOD_PER_ORG_GROUP',
          config: {
            aggregationEntityType: 'requested',
            dataSourceEntityType: reportCode.includes('PROVINCE') ? 'district' : 'sub_district',
            dataSourceEntityFilter: {
              attributes_type: 'LESMIS_Target_District',
            },
          },
        },
        {
          type: 'FINAL_EACH_YEAR',
          config: {
            dataSourceEntityType: reportCode.includes('PROVINCE') ? 'district' : 'sub_district',
            aggregationEntityType: 'requested',
          },
        },
      ],
    },
    transform: [
      {
        transform: 'updateColumns',
        insert: {
          organisationUnitCode: '=$organisationUnit',
          value: '=divide($value, 100)',
        },
        exclude: ['organisationUnit', 'dataElement', 'period'],
      },
    ],
  },
});

const getGPIReport = (reportCode, dataElements) => ({
  id: generateId(),
  code: reportCode,
  config: {
    fetch: {
      dataElements,
      aggregations: [
        {
          type: 'FINAL_EACH_YEAR',
          config: {
            dataSourceEntityType: reportCode.includes('PROVINCE') ? 'district' : 'sub_district',
            aggregationEntityType: 'requested',
          },
        },
      ],
    },
    transform: [
      {
        transform: 'updateColumns',
        insert: {
          organisationUnitCode: '=$organisationUnit',
          '=$dataElement': '=divide($value, 100)',
        },
        exclude: ['dataElement', 'value', 'organisationUnit'],
      },
      {
        transform: 'mergeRows',
        groupBy: ['organisationUnitCode', 'period'],
        using: 'single',
      },
      {
        transform: 'updateColumns',
        insert: {
          value: `=divide($${dataElements[0]},$${dataElements[1]})`,
        },
        exclude: [dataElements[0], dataElements[1]],
      },
    ],
  },
});

const getReport = (reportType, reportCode, dataElements) => {
  switch (reportType) {
    case 'GPI':
      return getGPIReport(reportCode, dataElements);
    case '40_PRIORITY_DISTRICTS':
      return getPriorityDistrictsReport(reportCode, dataElements);
    default:
      return getStandardReport(reportCode, dataElements);
  }
};

const PERMISSION_GROUP = 'LESMIS Public';

const getMapOverlay = (name, reportCode) => ({
  id: reportCode,
  name,
  userGroup: PERMISSION_GROUP,
  dataElementCode: 'value',
  isDataRegional: true,
  measureBuilder: 'useReportServer',
  measureBuilderConfig: {
    dataSourceType: 'custom',
    reportCode,
  },
  presentationOptions: {
    scaleType: 'performance',
    displayType: 'shaded-spectrum',
    measureLevel: reportCode.includes('PROVINCE') ? 'District' : 'SubDistrict',
    valueType: 'percentage',
    scaleBounds: {
      left: {
        max: 'auto',
      },
      right: {
        min: 'auto',
      },
    },
    periodGranularity: 'one_year_at_a_time',
  },
  countryCodes: '{"LA"}',
  projectCodes: '{laos_schools}',
});

const addMapOverlayGroup = async (db, parentId, overlayGroup) => {
  await insertObject(db, 'map_overlay_group', overlayGroup);
  return insertObject(db, 'map_overlay_group_relation', {
    id: generateId(),
    map_overlay_group_id: parentId,
    child_id: overlayGroup.id,
    child_type: 'mapOverlayGroup',
  });
};

const addMapOverlay = async (db, config) => {
  const { reportCode, reportType, dataElements, title, mapOverlayGroupId, sortOrder } = config;
  const report = getReport(reportType, reportCode, dataElements);
  const mapOverlay = getMapOverlay(title, reportCode);
  const permissionGroupId = await nameToId(db, 'permission_group', PERMISSION_GROUP);
  await insertObject(db, 'report', { ...report, permission_group_id: permissionGroupId });
  await insertObject(db, 'mapOverlay', mapOverlay);
  return insertObject(db, 'map_overlay_group_relation', {
    id: generateId(),
    map_overlay_group_id: mapOverlayGroupId,
    child_id: mapOverlay.id,
    child_type: 'mapOverlay',
    sort_order: sortOrder,
  });
};

const MAP_OVERLAYS = [
  {
    reportCode: 'LESMIS_GIR_PRIMARY_DISTRICT',
    reportType: 'STANDARD',
    title: 'GIR into last grade of primary',
    dataElements: 'gir_district_pe_t',
    mapOverlayGroupId: DISTRICT_OVERLAY_GROUP.id,
    sortOrder: 0,
  },
  {
    reportCode: 'LESMIS_GIR_GPI_PRIMARY_DISTRICT',
    reportType: 'GPI',
    title: 'GIR into last grade of primary, GPI',
    dataElements: ['gir_district_pe_f', 'gir_district_pe_m'],
    mapOverlayGroupId: DISTRICT_OVERLAY_GROUP.id,
    sortOrder: 1,
  },
  {
    reportCode: 'LESMIS_GIR_PRIORITY_DISTRICTS_PRIMARY_DISTRICT',
    reportType: '40_PRIORITY_DISTRICTS',
    title: 'GIR into last grade of primary, 40 priority districts',
    dataElements: ['gir_district_pe_t'],
    mapOverlayGroupId: DISTRICT_OVERLAY_GROUP.id,
    sortOrder: 2,
  },
  {
    reportCode: 'LESMIS_GIR_PRIMARY_PROVINCE',
    reportType: 'STANDARD',
    title: 'GIR into last grade of primary',
    dataElements: ['gir_province_pe_t'],
    mapOverlayGroupId: PROVINCE_OVERLAY_GROUP.id,
    sortOrder: 0,
  },
  {
    reportCode: 'LESMIS_GIR_GPI_PRIMARY_PROVINCE',
    reportType: 'GPI',
    title: 'GIR into last grade of primary, GPI',
    dataElements: ['gir_province_pe_f', 'gir_province_pe_m'],
    mapOverlayGroupId: PROVINCE_OVERLAY_GROUP.id,
    sortOrder: 1,
  },
  {
    reportCode: 'LESMIS_GIR_PRIORITY_DISTRICTS_PRIMARY_PROVINCE',
    reportType: '40_PRIORITY_DISTRICTS',
    title: 'GIR into last grade of primary, 40 priority districts',
    dataElements: ['gir_province_pe_t'],
    mapOverlayGroupId: PROVINCE_OVERLAY_GROUP.id,
    sortOrder: 2,
  },
];

exports.up = async function (db) {
  // Add Map Overlay Groups
  const rootOverlayId = await codeToId(db, 'map_overlay_group', 'Root');
  await addMapOverlayGroup(db, rootOverlayId, MAP_OVERLAY_GROUP);
  await addMapOverlayGroup(db, MAP_OVERLAY_GROUP.id, DISTRICT_OVERLAY_GROUP);
  await addMapOverlayGroup(db, MAP_OVERLAY_GROUP.id, PROVINCE_OVERLAY_GROUP);

  // Add Map Overlays
  MAP_OVERLAYS.forEach(config => {
    addMapOverlay(db, config);
  });
};

const removeMapOverlay = (db, reportCode) => {
  return db.runSql(`
    DELETE FROM "report" WHERE code = '${reportCode}';
    DELETE FROM "mapOverlay" WHERE "id" = '${reportCode}';
    DELETE FROM "map_overlay_group_relation" WHERE "child_id" = '${reportCode}';
  `);
};

const removeMapOverlayGroupRelation = async (db, groupCode) => {
  const overlayId = await codeToId(db, 'map_overlay_group', groupCode);
  await db.runSql(`
    DELETE FROM "map_overlay_group_relation" WHERE "child_id" = '${overlayId}';
  `);
};

exports.down = async function (db) {
  // Remove Map Overlay Groups Relations
  await removeMapOverlayGroupRelation(db, MAP_OVERLAY_GROUP.code);
  await removeMapOverlayGroupRelation(db, DISTRICT_OVERLAY_GROUP.code);
  await removeMapOverlayGroupRelation(db, PROVINCE_OVERLAY_GROUP.code);

  // Remove Map Overlays
  for (const { reportCode } of MAP_OVERLAYS) {
    await removeMapOverlay(db, reportCode);
  }

  // Remove Map Overlay Groups
  await db.runSql(`
    DELETE FROM "map_overlay_group" WHERE "code" = '${DISTRICT_OVERLAY_GROUP.code}'; 
    DELETE FROM "map_overlay_group" WHERE "code" = '${PROVINCE_OVERLAY_GROUP.code}'; 
    DELETE FROM "map_overlay_group" WHERE "code" = '${MAP_OVERLAY_GROUP.code}'; 
  `);
};

exports._meta = {
  version: 1,
};
