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

const PERMISSION_GROUP = 'LESMIS Public';

const MAP_OVERLAY_GROUP = {
  id: generateId(),
  name: 'Net Enrolment Rate',
  code: 'Laos_Schools_Net_Enrolment_Rate_Group',
};

const DISTRICT_OVERLAY_GROUP = {
  id: generateId(),
  name: 'District Level',
  code: 'Laos_Schools_Net_Enrolment_Rate_District_Level_Group',
};

const PROVINCE_OVERLAY_GROUP = {
  id: generateId(),
  name: 'Province Level',
  code: 'Laos_Schools_Net_Enrolment_Rate_Province_Level_Group',
};

const MAP_OVERLAYS = [
  {
    dataElement: 'ner_district_pe_t',
    name: 'NER Primary',
    reportCode: 'LESMIS_ner_primary_district',
    mapOverlayGroupId: DISTRICT_OVERLAY_GROUP.id,
    sortOrder: 0,
  },
  {
    dataElement: 'ner_district_lse_t',
    name: 'NER Lower Secondary',
    reportCode: 'LESMIS_ner_lower_secondary_district',
    mapOverlayGroupId: DISTRICT_OVERLAY_GROUP.id,
    sortOrder: 1,
  },
  {
    dataElement: 'ner_district_use_t',
    name: 'NER Upper Secondary',
    reportCode: 'LESMIS_ner_upper_secondary_district',
    mapOverlayGroupId: DISTRICT_OVERLAY_GROUP.id,
    sortOrder: 2,
  },
  {
    dataElement: 'ner_province_pe_t',
    name: 'NER Primary',
    reportCode: 'LESMIS_ner_primary_province',
    mapOverlayGroupId: PROVINCE_OVERLAY_GROUP.id,
    sortOrder: 0,
  },
  {
    dataElement: 'ner_province_lse_t',
    name: 'NER Lower Secondary',
    reportCode: 'LESMIS_ner_lower_secondary_province',
    mapOverlayGroupId: PROVINCE_OVERLAY_GROUP.id,
    sortOrder: 1,
  },
  {
    dataElement: 'ner_province_use_t',
    name: 'NER Upper Secondary',
    reportCode: 'LESMIS_ner_upuer_secondary_province',
    mapOverlayGroupId: PROVINCE_OVERLAY_GROUP.id,
    sortOrder: 2,
  },
];

const getMapOverlayGroupId = async function (db, code) {
  const results = await db.runSql(`select id from map_overlay_group where code = '${code}';`);

  if (results.rows.length > 0) {
    return results.rows[0].id;
  }

  throw new Error('MapOverlayGroup not found');
};

const addMapOverlayGroupRelation = async (db, parentId, childId, childType = 'mapOverlayGroup') => {
  return insertObject(db, 'map_overlay_group_relation', {
    id: generateId(),
    map_overlay_group_id: parentId,
    child_id: childId,
    child_type: childType,
  });
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
            dataSourceEntityType: reportCode.includes('province') ? 'district' : 'sub_district',
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
    measureLevel: reportCode.includes('province') ? 'District' : 'SubDistrict',
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

const getPermissionGroupId = async (db, name) => {
  const record = await db.runSql(`SELECT id FROM permission_group WHERE name = '${name}'`);
  return record.rows[0] && record.rows[0].id;
};

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
  const permissionGroupId = await getPermissionGroupId(db, PERMISSION_GROUP);
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

const removeMapOverlay = (db, reportCode) => {
  return db.runSql(`
    DELETE FROM "report" WHERE code = '${reportCode}';
    DELETE FROM "mapOverlay" WHERE "id" = '${reportCode}';
    DELETE FROM "map_overlay_group_relation" WHERE "child_id" = '${reportCode}';
  `);
};

const removeMapOverlayGroupRelation = async (db, groupCode) => {
  const overlayId = await getMapOverlayGroupId(db, groupCode);
  await db.runSql(`
    DELETE FROM "map_overlay_group_relation" WHERE "child_id" = '${overlayId}';
  `);
};

const removeMapOverlayGroups = async db => {
  await db.runSql(`
    DELETE FROM "map_overlay_group_relation" WHERE "child_id" = '${DISTRICT_OVERLAY_GROUP.id}';
    DELETE FROM "map_overlay_group_relation" WHERE "child_id" = '${PROVINCE_OVERLAY_GROUP.id}';
    DELETE FROM "map_overlay_group_relation" WHERE "child_id" = '${MAP_OVERLAY_GROUP.id}';
  `);

  return db.runSql(`
    DELETE FROM "map_overlay_group" WHERE "code" = '${MAP_OVERLAY_GROUP.code}'; 
    DELETE FROM "map_overlay_group" WHERE "code" = '${DISTRICT_OVERLAY_GROUP.code}';
    DELETE FROM "map_overlay_group" WHERE "code" = '${PROVINCE_OVERLAY_GROUP.code}';
  `);
};

exports.up = async function (db) {
  // Add Map Overlay Groups
  const rootOverlayId = await getMapOverlayGroupId(db, 'Root');
  await addMapOverlayGroup(db, rootOverlayId, MAP_OVERLAY_GROUP);
  await addMapOverlayGroup(db, MAP_OVERLAY_GROUP.id, DISTRICT_OVERLAY_GROUP);
  await addMapOverlayGroup(db, MAP_OVERLAY_GROUP.id, PROVINCE_OVERLAY_GROUP);

  // Add Map Overlays
  MAP_OVERLAYS.forEach(({ name, dataElement, reportCode, mapOverlayGroupId, sortOrder }) => {
    addMapOverlay(db, name, dataElement, reportCode, mapOverlayGroupId, sortOrder);
  });
};

// Relations are deleted internally
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
