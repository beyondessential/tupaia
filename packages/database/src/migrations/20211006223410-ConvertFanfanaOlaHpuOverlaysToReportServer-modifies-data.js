'use strict';

import { insertObject, nameToId, codeToId, deleteObject, generateId } from '../utilities';

var dbm;
var type;
var seed;

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */

const PERMISSION_GROUP = 'Tonga Health Promotion Unit';
const HPU_GROUP_CODE = 'Fanafana_Ola_HPU';
const LEGACY_OVERLAY_CODES = [
  'TO_HPU_NCD_Risk_Factory_Screening_Type_Setting_Unique',
  'TO_HPU_Health_Talks_Training_Type_Setting_Unique',
  'TO_HPU_Physical_Activity_Type_Setting_Unique',
];

const NEW_OVERLAY_CONFIGS = [
  {
    reportCode: 'FANAFANA_hpu_ncd_risk_factor_screening_setting_type_map',
    dataElements: ['HP31n'],
    name: 'NCD Risk Factor Screening: Setting Type',
    dataGroups: ['HP02'],
    sortOrder: 0,
  },
  {
    reportCode: 'FANAFANA_hpu_health_talks_training_type_setting_map',
    dataElements: ['HP281'],
    name: 'Health Talks and Training: Setting Type',
    dataGroups: ['HP07'],
    sortOrder: 1,
  },
  {
    reportCode: 'FANAFANA_hpu_physical_activity_type_setting_map',
    dataElements: ['HP4'],
    name: 'Physical Activity: Setting Type',
    dataGroups: ['HP01'],
    sortOrder: 2,
  },
];

const getReportObject = (reportCode, dataElements, dataGroups) => ({
  code: reportCode,
  config: {
    fetch: {
      dataElements,
      dataGroups,
    },
    transform: [
      {
        transform: 'updateColumns',
        exclude: ['event', 'eventDate', 'orgUnitName', 'orgUnit', dataElements[0]],
        insert: {
          organisationUnitCode: '=$orgUnit',
          Church: `= eq($${dataElements[0]},'Church') ? 1 : undefined`,
          Community: `= eq($${dataElements[0]},'Community') ? 1 : undefined`,
          Workplace: `= eq($${dataElements[0]},'Workplace') ? 1 : undefined`,
          School: `= eq($${dataElements[0]},'School') ? 1 : undefined`,
          Unique: `=$${dataElements[0]}`,
        },
      },
      {
        transform: 'mergeRows',
        groupBy: ['organisationUnitCode'],
        using: {
          Unique: 'unique',
          '*': 'sum',
        },
      },
      {
        transform: 'insertColumns',
        columns: {
          Total: '=sum($Church, $Community, $Workplace, $School)',
        },
      },
    ],
  },
});

const getOverlayObject = (reportCode, name) => ({
  id: reportCode,
  name,
  userGroup: PERMISSION_GROUP,
  isDataRegional: true,
  dataElementCode: 'Unique',
  legacy: false,
  report_code: reportCode,
  measureBuilder: 'useReportServer',
  measureBuilderConfig: {
    dataSourceType: 'custom',
    reportCode,
  },
  presentationOptions: {
    measureLevel: 'Village',
    values: [
      {
        icon: 'circle',
        name: 'Church',
        color: 'darkblue',
        value: 'Church',
      },
      {
        icon: 'circle',
        name: 'School',
        color: 'orange',
        value: 'School',
      },
      {
        icon: 'circle',
        name: 'Workplace',
        color: 'pink',
        value: 'Workplace',
      },
      {
        icon: 'circle',
        name: 'Community',
        color: 'lightblue',
        value: 'Community',
      },
      {
        icon: 'circle',
        name: 'Multiple Settings',
        color: 'yellow',
        value: 'NO_UNIQUE_VALUE',
      },
      {
        icon: 'circle',
        name: 'No data',
        color: 'Grey',
        value: 'null',
      },
    ],
    measureConfig: {
      Church: {
        name: 'Church Screenings',
        sortOrder: 1,
      },
      Community: {
        name: 'Community Screenings',
        sortOrder: 2,
      },
      School: {
        name: 'School Screenings',
        sortOrder: 3,
      },
      Workplace: {
        name: 'Workplace Screenings',
        sortOrder: 4,
      },
      Total: {
        name: 'Total Screenings',
        sortOrder: 0,
      },
      $all: {
        type: 'popup-only',
        values: [
          {
            value: null,
            hideFromPopup: true,
          },
        ],
      },
    },
    displayType: 'icon',
    hideFromPopup: true,
  },
  countryCodes: '{"TO"}',
  projectCodes: '{"fanafana"}',
});

const addMapOverlay = async (db, permissionGroupId, mapOverlayGroupId, config) => {
  const { reportCode, dataElements, dataGroups, name, sortOrder } = config;
  const report = getReportObject(reportCode, dataElements, dataGroups);
  const mapOverlay = getOverlayObject(reportCode, name);
  await insertObject(db, 'report', {
    id: generateId(),
    permission_group_id: permissionGroupId,
    ...report,
  });
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

exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = async function (db) {
  // get Permission Group Id and overlay group id
  const permissionGroupId = await nameToId(db, 'permission_group', PERMISSION_GROUP);
  const mapOverlayGroupId = await codeToId(db, 'map_overlay_group', HPU_GROUP_CODE);
  // Remove legacy overlay relations
  for (const code of LEGACY_OVERLAY_CODES) {
    await db.runSql(`
    DELETE FROM "map_overlay_group_relation" WHERE "child_id" = '${code}';
  `);
  }
  // Add new map overlays
  for (const config of NEW_OVERLAY_CONFIGS) {
    await addMapOverlay(db, permissionGroupId, mapOverlayGroupId, config);
  }
};

exports.down = async function (db) {
  // Remove map overlays
  for (const { reportCode } of NEW_OVERLAY_CONFIGS) {
    await removeMapOverlay(db, reportCode);
  }
  // get overlaygroup id
  const mapOverlayGroupId = await codeToId(db, 'map_overlay_group', HPU_GROUP_CODE);
  // Reinstall legacy overlay relations
  for (const code of LEGACY_OVERLAY_CODES) {
    await insertObject(db, 'map_overlay_group_relation', {
      id: generateId(),
      map_overlay_group_id: mapOverlayGroupId,
      child_id: code,
      child_type: 'mapOverlay',
    });
  }
};

exports._meta = {
  version: 1,
};
