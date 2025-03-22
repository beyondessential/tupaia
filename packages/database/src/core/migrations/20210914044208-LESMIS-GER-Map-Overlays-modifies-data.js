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
  name: 'Gross Enrolment Rate',
  code: 'Gross_Enrolment_Rate',
};

const DISTRICT_OVERLAY_GROUP = {
  id: generateId(),
  name: 'District Level',
  code: 'LESMIS_GER_DISTRICT_LEVEL_GROUP',
};

const PROVINCE_OVERLAY_GROUP = {
  id: generateId(),
  name: 'Province Level',
  code: 'LESMIS_GER_PROVINCE_LEVEL_GROUP',
};

const getReport = (reportCode, dataElement) => ({
  id: generateId(),
  code: reportCode,
  config: {
    fetch: {
      dataElements: [dataElement],
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

const addMapOverlay = async (db, name, dataElement, reportCode, mapOverlayGroupId, sortOrder) => {
  const report = getReport(reportCode, dataElement);
  const mapOverlay = getMapOverlay(name, reportCode);
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
    dataElement: 'ger_district_pe_t',
    name: 'GER Primary',
    reportCode: 'LESMIS_GER_PRIMARY_DISTRICT',
    mapOverlayGroupId: DISTRICT_OVERLAY_GROUP.id,
    sortOrder: 0,
  },
  {
    dataElement: 'ger_district_lse_t',
    name: 'GER Lower Secondary',
    reportCode: 'LESMIS_GER_LOWER_SECONDARY_DISTRICT',
    mapOverlayGroupId: DISTRICT_OVERLAY_GROUP.id,
    sortOrder: 1,
  },
  {
    dataElement: 'ger_district_use_t',
    name: 'GER Upper Secondary',
    reportCode: 'LESMIS_GER_UPPER_SECONDARY_DISTRICT',
    mapOverlayGroupId: DISTRICT_OVERLAY_GROUP.id,
    sortOrder: 2,
  },
  {
    dataElement: 'ger_province_pe_t',
    name: 'GER Primary',
    reportCode: 'LESMIS_GER_PRIMARY_PROVINCE',
    mapOverlayGroupId: PROVINCE_OVERLAY_GROUP.id,
    sortOrder: 0,
  },
  {
    dataElement: 'ger_province_lse_t',
    name: 'GER Lower Secondary',
    reportCode: 'LESMIS_GER_LOWER_SECONDARY_PROVINCE',
    mapOverlayGroupId: PROVINCE_OVERLAY_GROUP.id,
    sortOrder: 1,
  },
  {
    dataElement: 'ger_province_use_t',
    name: 'GER Upper Secondary',
    reportCode: 'LESMIS_GER_UPPER_SECONDARY_PROVINCE',
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
  MAP_OVERLAYS.forEach(({ name, dataElement, reportCode, mapOverlayGroupId, sortOrder }) => {
    addMapOverlay(db, name, dataElement, reportCode, mapOverlayGroupId, sortOrder);
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
