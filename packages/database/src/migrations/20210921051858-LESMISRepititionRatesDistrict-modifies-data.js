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
const DISTRICT_OVERLAY_GROUP_ID = '5f2c7ddc61f76a513a000215';

// const MAP_OVERLAYS = [
//   {
//     dataElement: 'rr_district_p1_t',
//     name: 'Grade 1 Repetition Rate',
//     reportCode: 'LESMIS_primary_1_repetition_rate_district',
//     mapOverlayGroupId: DISTRICT_OVERLAY_GROUP_ID,
//     sortOrder: 0,
//   },
//   {
//     dataElement: 'rr_district_p2_t',
//     name: 'Grade 1 Repetition Rate',
//     reportCode: 'LESMIS_primary_2_repetition_rate_district',
//     mapOverlayGroupId: DISTRICT_OVERLAY_GROUP_ID,
//     sortOrder: 1,
//   },
// ];

const getMapOverlayObject = (grade, sortOrder) => {
  return [
    {
      dataElement: `rr_district_p${grade}_t`,
      name: `Grade ${grade} Repetition Rate`,
      reportCode: `LESMIS_primary_${grade}_repetition_rate_district`,
      mapOverlayGroupId: DISTRICT_OVERLAY_GROUP_ID,
      sortOrder,
    },
  ];
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
});

const getPermissionGroupId = async (db, name) => {
  const record = await db.runSql(`SELECT id FROM permission_group WHERE name = '${name}'`);
  return record.rows[0] && record.rows[0].id;
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

exports.up = async function (db) {
  // Add Map Overlays
  for (var i = 0; i < 2; i++) {
    const grade = i + 1;
    const { name, dataElement, reportCode, mapOverlayGroupId, sortOrder } = getMapOverlayObject(
      grade,
      i,
    );
    addMapOverlay(db, name, dataElement, reportCode, mapOverlayGroupId, sortOrder);
  }

  // MAP_OVERLAYS.forEach(({ name, dataElement, reportCode, mapOverlayGroupId, sortOrder }) => {
  //   addMapOverlay(db, name, dataElement, reportCode, mapOverlayGroupId, sortOrder);
  // });
};

exports.down = async function (db) {
  // Remove Map Overlays
  for (const { reportCode } of MAP_OVERLAYS) {
    await removeMapOverlay(db, reportCode);
  }
};

exports._meta = {
  version: 1,
};
