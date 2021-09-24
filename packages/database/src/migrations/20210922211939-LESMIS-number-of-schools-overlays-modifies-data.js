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

const getReport = (reportCode, dataElements) => {
  const aggregations = [
    {
      type: 'FINAL_EACH_YEAR',
      config: {
        dataSourceEntityType: 'sub_district',
        aggregationEntityType: 'requested',
      },
    },
  ];

  if (reportCode.includes('Province')) {
    aggregations.push({
      type: 'SUM_PER_ORG_GROUP',
      config: {
        dataSourceEntityType: 'sub_district',
        aggregationEntityType: 'district',
      },
    });
  }

  return {
    code: reportCode,
    config: {
      fetch: {
        dataElements,
        aggregations,
      },
      transform: [
        {
          transform: 'updateColumns',
          insert: {
            organisationUnitCode: '=$organisationUnit',
          },
          include: ['period', 'value'],
        },
        {
          transform: 'mergeRows',
          groupBy: ['organisationUnitCode', 'period'],
          using: 'sum',
        },
      ],
    },
  };
};

const PERMISSION_GROUP = 'LESMIS Public';

const getMapOverlay = (name, reportCode) => ({
  id: reportCode,
  report_code: reportCode,
  legacy: false,
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
    scaleType: 'neutral',
    displayType: 'shaded-spectrum',
    measureLevel: reportCode.includes('Province') ? 'District' : 'SubDistrict',
    valueType: 'number',
    scaleBounds: {
      left: {
        max: '0',
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
  const { reportCode, dataElements, name, sortOrder } = config;
  const report = getReport(reportCode, dataElements);
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

const OVERLAY_CODE = 'LESMIS_Number_Of_Schools';

const OVERLAY_GROUPS = [
  {
    parentCode: 'Root',
    children: [
      {
        name: 'Number Of Schools and Institutions',
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
];

const MAP_OVERLAYS = [
  {
    parentCode: `${OVERLAY_CODE}_District_Group`,
    children: [
      {
        reportCode: `${OVERLAY_CODE}_District_ECE_map`,
        name: 'Number of ECE Centres/Kindergartens',
        dataElements: ['nosch_ece'],
        sortOrder: 0,
      },
      {
        reportCode: `${OVERLAY_CODE}_District_PE_map`,
        name: 'Number of Primary Schools',
        dataElements: ['nosch_pe'],
        sortOrder: 1,
      },
      {
        reportCode: `${OVERLAY_CODE}_District_LSE_map`,
        name: 'Number of Lower Secondary Schools',
        dataElements: ['nosch_type6_private', 'nosch_type6_public'],
        sortOrder: 2,
      },
      {
        reportCode: `${OVERLAY_CODE}_District_USE_map`,
        name: 'Number of Upper Secondary Schools',
        dataElements: ['nosch_type7_private', 'nosch_type7_public'],
        sortOrder: 3,
      },
      {
        reportCode: `${OVERLAY_CODE}_District_COMPLETE_map`,
        name: 'Number of Complete Secondary Schools',
        dataElements: ['nosch_type8_private', 'nosch_type8_public'],
        sortOrder: 4,
      },
    ],
  },
  {
    parentCode: `${OVERLAY_CODE}_Province_Group`,
    children: [
      {
        reportCode: `${OVERLAY_CODE}_Province_ECE_Group`,
        name: 'Number of ECE Centres/Kindergartens',
        dataElements: ['nosch_ece'],
        sortOrder: 0,
      },
      {
        reportCode: `${OVERLAY_CODE}_Province_PE_map`,
        name: 'Number of Primary Schools',
        dataElements: ['nosch_pe'],
        sortOrder: 1,
      },
      {
        reportCode: `${OVERLAY_CODE}_Province_LSE_map`,
        name: 'Number of Lower Secondary Schools',
        dataElements: ['nosch_type6_private', 'nosch_type6_public'],
        sortOrder: 2,
      },
      {
        reportCode: `${OVERLAY_CODE}_Province_USE_map`,
        name: 'Number of Upper Secondary Schools',
        dataElements: ['nosch_type7_private', 'nosch_type7_public'],
        sortOrder: 3,
      },
      {
        reportCode: `${OVERLAY_CODE}_Province_COMPLETE_map`,
        name: 'Number of Complete Secondary Schools',
        dataElements: ['nosch_type8_private', 'nosch_type8_public'],
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
