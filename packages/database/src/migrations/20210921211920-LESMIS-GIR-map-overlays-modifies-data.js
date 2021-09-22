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

const addMapOverlayGroup = async (db, { name, code, parentCode }) => {
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

const addMapOverlay = async (db, config) => {
  const { reportCode, reportType, dataElements, name, parentCode, sortOrder } = config;
  const report = getReport(reportType, reportCode, dataElements);
  const mapOverlay = getMapOverlay(name, reportCode);
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
    name: 'Gross Intake Rate',
    code: `${OVERLAY_CODE}_Group`,
    parentCode: 'Root',
  },
  {
    name: 'District Level',
    code: `${OVERLAY_CODE}_District_Group`,
    parentCode: `${OVERLAY_CODE}_Group`,
  },
  {
    name: 'Province Level',
    code: `${OVERLAY_CODE}_Province_Group`,
    parentCode: `${OVERLAY_CODE}_Group`,
  },
  {
    name: 'Primary Level',
    code: `${OVERLAY_CODE}_District_Primary_Group`,
    parentCode: `${OVERLAY_CODE}_District_Group`,
  },
  {
    name: 'Secondary Level',
    code: `${OVERLAY_CODE}_District_Secondary_Group`,
    parentCode: `${OVERLAY_CODE}_District_Group`,
  },
  {
    name: 'Primary Level',
    code: `${OVERLAY_CODE}_Province_Primary_Group`,
    parentCode: `${OVERLAY_CODE}_Province_Group`,
  },
  {
    name: 'Secondary Level',
    code: `${OVERLAY_CODE}_Province_Secondary_Group`,
    parentCode: `${OVERLAY_CODE}_Province_Group`,
  },
];

const MAP_OVERLAYS = [
  {
    reportCode: `${OVERLAY_CODE}_Primary_District`,
    reportType: 'STANDARD',
    name: 'GIR into last grade of primary',
    dataElements: 'gir_district_pe_t',
    parentCode: `${OVERLAY_CODE}_District_Primary_Group`,
    sortOrder: 0,
  },
  {
    reportCode: `${OVERLAY_CODE}_GPI_Primary_District`,
    reportType: 'GPI',
    name: 'GIR into last grade of primary, GPI',
    dataElements: ['gir_district_pe_f', 'gir_district_pe_m'],
    parentCode: `${OVERLAY_CODE}_District_Primary_Group`,
    sortOrder: 1,
  },
  {
    reportCode: `${OVERLAY_CODE}_Priority_Districts_Primary_District`,
    reportType: '40_PRIORITY_DISTRICTS',
    name: 'GIR into last grade of primary, 40 priority districts',
    dataElements: ['gir_district_pe_t'],
    parentCode: `${OVERLAY_CODE}_District_Primary_Group`,
    sortOrder: 2,
  },
  {
    reportCode: `${OVERLAY_CODE}_Primary_Province`,
    reportType: 'STANDARD',
    name: 'GIR into last grade of primary',
    dataElements: ['gir_province_pe_t'],
    parentCode: `${OVERLAY_CODE}_Province_Primary_Group`,
    sortOrder: 0,
  },
  {
    reportCode: `${OVERLAY_CODE}_GPI_Primary_Province`,
    reportType: 'GPI',
    name: 'GIR into last grade of primary, GPI',
    dataElements: ['gir_province_pe_f', 'gir_province_pe_m'],
    parentCode: `${OVERLAY_CODE}_Province_Primary_Group`,
    sortOrder: 1,
  },
  {
    reportCode: `${OVERLAY_CODE}_Priority_Districts_Primary_Province`,
    reportType: '40_PRIORITY_DISTRICTS',
    name: 'GIR into last grade of primary, 40 priority districts',
    dataElements: ['gir_province_pe_t'],
    parentCode: `${OVERLAY_CODE}_Province_Primary_Group`,
    sortOrder: 2,
  },
];

exports.up = async function (db) {
  // Add Map Overlay Groups
  for (const config of OVERLAY_GROUPS) {
    await addMapOverlayGroup(db, config);
  }

  // Add Map Overlays
  for (const config of MAP_OVERLAYS) {
    await addMapOverlay(db, config);
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
  for (const { code } of OVERLAY_GROUPS) {
    await removeMapOverlayGroupRelation(db, code);
  }

  // Remove Map Overlays
  for (const { reportCode } of MAP_OVERLAYS) {
    await removeMapOverlay(db, reportCode);
  }

  // Remove Map Overlay Groups
  const overlayCodes = OVERLAY_GROUPS.map(config => config.code);
  await db.runSql(`
    DELETE FROM "map_overlay_group" WHERE "code" IN (${arrayToDbString(overlayCodes)});
  `);
};

exports._meta = {
  version: 1,
};
