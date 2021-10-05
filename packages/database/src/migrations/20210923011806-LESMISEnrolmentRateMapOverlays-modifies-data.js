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

const getReport = (reportCode, dataElements) => ({
  code: reportCode,
  config: {
    fetch: {
      dataElements,
      aggregations: [
        {
          type: 'FINAL_EACH_YEAR',
          config: {
            dataSourceEntityType: 'sub_district',
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
    measureLevel: 'SubDistrict',
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

  legacy: false,
  report_code: reportCode,
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

const OVERLAY_CODE = 'LESMIS_enrolment_ece';

const OVERLAY_GROUPS = [
  {
    parentCode: 'Root',
    children: [
      {
        name: 'ECE/Pre-Primary Enrolment',
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
    ],
  },
];

const MAP_OVERLAYS = [
  {
    parentCode: `${OVERLAY_CODE}_District_Group`,
    children: [
      {
        reportCode: `${OVERLAY_CODE}_0_2_District_map`,
        name: 'Enrolment 0-2 year olds',
        dataElements: ['er_district_ece_0_2_t'],
        sortOrder: 0,
      },
    ],
  },
  {
    parentCode: `${OVERLAY_CODE}_District_Group`,
    children: [
      {
        reportCode: `${OVERLAY_CODE}_3_4_District_map`,
        name: 'Enrolment 3-4 year olds',
        dataElements: ['er_district_ece_3_4_t'],
        sortOrder: 1,
      },
    ],
  },
  {
    parentCode: `${OVERLAY_CODE}_District_Group`,
    children: [
      {
        reportCode: `${OVERLAY_CODE}_5_District_map`,
        name: 'Enrolment 5 year olds',
        dataElements: ['er_district_ece_5_t'],
        sortOrder: 2,
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
