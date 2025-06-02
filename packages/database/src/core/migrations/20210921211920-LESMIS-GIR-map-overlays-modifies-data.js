'use strict';

import { generateId, insertObject, codeToId, nameToId, arrayToDbString } from '../utilities';

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

const getStandardReport = (reportCode, dataElements) => ({
  code: reportCode,
  config: {
    fetch: {
      dataElements,
      aggregations: [
        {
          type: 'FINAL_EACH_YEAR',
          config: {
            dataSourceEntityType: reportCode.includes('Province') ? 'district' : 'sub_district',
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
  code: reportCode,
  config: {
    fetch: {
      dataElements,
      aggregations: [
        {
          type: 'FINAL_EACH_YEAR',
          config: {
            dataSourceEntityType: reportCode.includes('Province') ? 'district' : 'sub_district',
            aggregationEntityType: 'requested',
            dataSourceEntityFilter: {
              attributes_type: 'LESMIS_Target_District',
            },
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
  code: reportCode,
  config: {
    fetch: {
      dataElements,
      aggregations: [
        {
          type: 'FINAL_EACH_YEAR',
          config: {
            dataSourceEntityType: reportCode.includes('Province') ? 'district' : 'sub_district',
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
          '=$dataElement': '=$value',
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
  legacy: false,
  report_code: reportCode,
  measureBuilder: 'useReportServer',
  measureBuilderConfig: {
    dataSourceType: 'custom',
    reportCode,
  },
  presentationOptions: {
    scaleType: 'performance',
    displayType: 'shaded-spectrum',
    measureLevel: reportCode.includes('Province') ? 'District' : 'SubDistrict',
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

const getGPIMapOverlay = (name, reportCode) => ({
  id: reportCode,
  name,
  userGroup: PERMISSION_GROUP,
  dataElementCode: 'value',
  isDataRegional: true,
  legacy: false,
  report_code: reportCode,
  measureBuilder: 'useReportServer',
  measureBuilderConfig: {
    dataSourceType: 'custom',
    reportCode,
  },
  presentationOptions: {
    scaleType: 'gpi',
    displayType: 'shaded-spectrum',
    measureLevel: reportCode.includes('Province') ? 'District' : 'SubDistrict',
    scaleBounds: {
      left: {
        max: 0,
      },
      right: {
        min: 2,
      },
    },
    periodGranularity: 'one_year_at_a_time',
  },
  countryCodes: '{"LA"}',
  projectCodes: '{laos_schools}',
});

const addMapOverlayGroup = async (db, parentCode, { name, code }) => {
  const parentId = await codeToId(db, 'map_overlay_group', parentCode);

  const overlayGroupId = generateId();
  await insertObject(db, 'map_overlay_group', { id: overlayGroupId, name, code });

  return insertObject(db, 'map_overlay_group_relation', {
    id: generateId(),
    map_overlay_group_id: parentId,
    child_id: overlayGroupId,
    child_type: 'mapOverlayGroup',
  });
};

const addMapOverlay = async (db, parentCode, config) => {
  const { reportCode, reportType, dataElements, name, sortOrder } = config;
  const report = getReport(reportType, reportCode, dataElements);
  const mapOverlay =
    reportType === 'GPI' ? getGPIMapOverlay(name, reportCode) : getMapOverlay(name, reportCode);
  const permissionGroupId = await nameToId(db, 'permission_group', PERMISSION_GROUP);
  await insertObject(db, 'report', {
    id: generateId(),
    permission_group_id: permissionGroupId,
    ...report,
  });
  await insertObject(db, 'mapOverlay', mapOverlay);

  const mapOverlayGroupId = await codeToId(db, 'map_overlay_group', parentCode);
  return insertObject(db, 'map_overlay_group_relation', {
    id: generateId(),
    map_overlay_group_id: mapOverlayGroupId,
    child_id: mapOverlay.id,
    child_type: 'mapOverlay',
    sort_order: sortOrder,
  });
};

const OVERLAY_CODE = 'LESMIS_GIR';

const OVERLAY_GROUPS = [
  {
    parentCode: 'Root',
    children: [
      {
        name: 'Gross Intake Rate',
        code: `${OVERLAY_CODE}_Group`,
      },
    ],
  },
  {
    parentCode: `${OVERLAY_CODE}_Group`,
    children: [
      {
        name: 'District Level',
        code: `${OVERLAY_CODE}_District_Group`,
      },
      {
        name: 'Province Level',
        code: `${OVERLAY_CODE}_Province_Group`,
      },
    ],
  },
  {
    parentCode: `${OVERLAY_CODE}_District_Group`,
    children: [
      {
        name: 'Primary Level',
        code: `${OVERLAY_CODE}_District_Primary_Group`,
      },
      {
        name: 'Secondary Level',
        code: `${OVERLAY_CODE}_District_Secondary_Group`,
      },
    ],
  },
  {
    parentCode: `${OVERLAY_CODE}_Province_Group`,
    children: [
      {
        name: 'Primary Level',
        code: `${OVERLAY_CODE}_Province_Primary_Group`,
      },
      {
        name: 'Secondary Level',
        code: `${OVERLAY_CODE}_Province_Secondary_Group`,
      },
    ],
  },
];

const MAP_OVERLAYS = [
  {
    parentCode: `${OVERLAY_CODE}_District_Primary_Group`,
    children: [
      {
        reportCode: `${OVERLAY_CODE}_District_Primary_map`,
        reportType: 'STANDARD',
        name: 'GIR into last grade of primary',
        dataElements: ['gir_district_pe_t'],
        sortOrder: 0,
      },
      {
        reportCode: `${OVERLAY_CODE}_GPI_District_Primary_map`,
        reportType: 'GPI',
        name: 'GIR into last grade of primary, GPI',
        dataElements: ['gir_district_pe_f', 'gir_district_pe_m'],
        sortOrder: 1,
      },
      {
        reportCode: `${OVERLAY_CODE}_Priority_Districts_District_Primary_map`,
        reportType: '40_PRIORITY_DISTRICTS',
        name: 'GIR into last grade of primary, 40 priority districts',
        dataElements: ['gir_district_pe_t'],
        sortOrder: 2,
      },
    ],
  },
  {
    parentCode: `${OVERLAY_CODE}_District_Secondary_Group`,
    children: [
      {
        reportCode: `${OVERLAY_CODE}_District_Lower_Secondary_map`,
        reportType: 'STANDARD',
        name: 'GIR into last grade of lower secondary',
        dataElements: ['gir_district_lse_t'],
        sortOrder: 0,
      },
      {
        reportCode: `${OVERLAY_CODE}_GPI_District_Lower_Secondary_map`,
        reportType: 'GPI',
        name: 'GIR into last grade of lower secondary, GPI',
        dataElements: ['gir_district_lse_f', 'gir_district_lse_m'],
        sortOrder: 1,
      },
      {
        reportCode: `${OVERLAY_CODE}_Priority_Districts_District_Lower_Secondary_map`,
        reportType: '40_PRIORITY_DISTRICTS',
        name: 'GIR into last grade of lower secondary, 40 priority districts',
        dataElements: ['gir_district_lse_t'],
        sortOrder: 2,
      },
      {
        reportCode: `${OVERLAY_CODE}_District_Upper_Secondary_map`,
        reportType: 'STANDARD',
        name: 'GIR into last grade of upper secondary',
        dataElements: ['gir_district_use_t'],
        sortOrder: 3,
      },
      {
        reportCode: `${OVERLAY_CODE}_GPI_District_Upper_Secondary_map`,
        reportType: 'GPI',
        name: 'GIR into last grade of upper secondary, GPI',
        dataElements: ['gir_district_use_f', 'gir_district_use_m'],
        sortOrder: 4,
      },
      {
        reportCode: `${OVERLAY_CODE}_Priority_Districts_District_Upper_Secondary_map`,
        reportType: '40_PRIORITY_DISTRICTS',
        name: 'GIR into last grade of upper secondary, 40 priority districts',
        dataElements: ['gir_district_use_t'],
        sortOrder: 5,
      },
    ],
  },
  {
    parentCode: `${OVERLAY_CODE}_Province_Primary_Group`,
    children: [
      {
        reportCode: `${OVERLAY_CODE}_Province_Primary_map`,
        reportType: 'STANDARD',
        name: 'GIR into last grade of primary',
        dataElements: ['gir_province_pe_t'],
        sortOrder: 0,
      },
      {
        reportCode: `${OVERLAY_CODE}_GPI_Province_Primary_map`,
        reportType: 'GPI',
        name: 'GIR into last grade of primary, GPI',
        dataElements: ['gir_province_pe_f', 'gir_province_pe_m'],
        sortOrder: 1,
      },
    ],
  },
  {
    parentCode: `${OVERLAY_CODE}_Province_Secondary_Group`,
    children: [
      {
        reportCode: `${OVERLAY_CODE}_Province_Lower_Secondary_map`,
        reportType: 'STANDARD',
        name: 'GIR into last grade of lower secondary',
        dataElements: ['gir_province_lse_t'],
        sortOrder: 0,
      },
      {
        reportCode: `${OVERLAY_CODE}_GPI_Province_Lower_Secondary_map`,
        reportType: 'GPI',
        name: 'GIR into last grade of lower secondary, GPI',
        dataElements: ['gir_province_lse_f', 'gir_province_lse_m'],
        sortOrder: 1,
      },
      {
        reportCode: `${OVERLAY_CODE}_Province_Upper_Secondary_map`,
        reportType: 'STANDARD',
        name: 'GIR into last grade of upper secondary',
        dataElements: ['gir_province_use_t'],
        sortOrder: 3,
      },
      {
        reportCode: `${OVERLAY_CODE}_GPI_Province_Upper_Secondary_map`,
        reportType: 'GPI',
        name: 'GIR into last grade of upper secondary, GPI',
        dataElements: ['gir_province_use_f', 'gir_province_use_m'],
        sortOrder: 4,
      },
    ],
  },
];

exports.up = async function (db) {
  // Add Map Overlay Groups
  for (const { parentCode, children } of OVERLAY_GROUPS) {
    for (const config of children) {
      await addMapOverlayGroup(db, parentCode, config);
    }
  }

  // Add Map Overlays
  for (const { parentCode, children } of MAP_OVERLAYS) {
    for (const config of children) {
      await addMapOverlay(db, parentCode, config);
    }
  }
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
  for (const { children } of OVERLAY_GROUPS) {
    for (const { code } of children) {
      await removeMapOverlayGroupRelation(db, code);
    }
  }

  // Remove Map Overlays
  for (const { children } of MAP_OVERLAYS) {
    for (const { reportCode } of children) {
      await removeMapOverlay(db, reportCode);
    }
  }

  // Remove Map Overlay Groups
  const groupCodes = OVERLAY_GROUPS.reduce(
    (allCodes, group) => [...allCodes, ...group.children.map(config => config.code)],
    [],
  );
  await db.runSql(`
    DELETE FROM "map_overlay_group" WHERE "code" IN (${arrayToDbString(groupCodes)});
  `);
};

exports._meta = {
  version: 1,
};
