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

const getOverlayNames = (gradeNum, educationLevel) => {
  return {
    name: `Grade ${educationLevel === 'p' ? gradeNum : gradeNum + 5} Repetition Rate`,
    dataElement: `rr_district_${educationLevel}${gradeNum}_t`,
    reportCode: `LESMIS_grade_${
      educationLevel === 'p' ? gradeNum : gradeNum + 5
    }_repetition_rate_district`,
  };
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

const addMapOverlay = async (db, gradeNum, educationLevel, sortOrder) => {
  const { name, dataElement, reportCode } = getOverlayNames(gradeNum, educationLevel);
  const mapOverlayGroupId = DISTRICT_OVERLAY_GROUP_ID;
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

const removeMapOverlay = (db, gradeNum, educationLevel) => {
  const { reportCode } = getOverlayNames(gradeNum, educationLevel);
  return db.runSql(`
    DELETE FROM "report" WHERE code = '${reportCode}';
    DELETE FROM "mapOverlay" WHERE "id" = '${reportCode}';
    DELETE FROM "map_overlay_group_relation" WHERE "child_id" = '${reportCode}';
  `);
};

exports.up = async function (db) {
  // Add Primary Overlays
  for (let i = 1; i < 6; i++) {
    addMapOverlay(db, i, 'p', i - 1);
  }

  // Add Secondary Overlays
  for (let i = 1; i < 8; i++) {
    addMapOverlay(db, i, 's', i + 4);
  }
};

exports.down = async function (db) {
  // Remove primary overlays
  for (let i = 1; i < 6; i++) {
    removeMapOverlay(db, i, 'p');
  }
  // Remove secondary overlays
  for (let i = 1; i < 8; i++) {
    removeMapOverlay(db, i, 's');
  }
};

exports._meta = {
  version: 1,
};
