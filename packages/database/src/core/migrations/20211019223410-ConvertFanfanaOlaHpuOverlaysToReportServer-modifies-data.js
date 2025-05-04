'use strict';

import { insertObject, nameToId, codeToId, updateValues, generateId } from '../utilities';

var dbm;
var type;
var seed;

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */

const PERMISSION_GROUP = 'Tonga Health Promotion Unit';
const HPU_GROUP_CODE = 'Fanafana_Ola_HPU';
const NEW_GROUP_VALUES = {
  name: 'Health Promotion Unit',
  code: 'Health_Promotion_Unit',
};
const LEGACY_OVERLAY_CODES = [
  'TO_HPU_NCD_Risk_Factory_Screening_Type_Setting_Unique',
  'TO_HPU_Health_Talks_Training_Type_Setting_Unique',
  'TO_HPU_Physical_Activity_Type_Setting_Unique',
];

const NEW_OVERLAY_CONFIGS = [
  {
    reportCode: 'FANAFANA_hpu_ncd_risk_factor_screening_setting_type_map',
    code: 'FANAFANA_hpu_ncd_risk_factor_screening_setting_type',
    dataElements: ['HP31n'],
    name: 'NCD Risk Factor Screening: Setting Type',
    dataGroups: ['HP02'],
    sortOrder: 0,
  },
  {
    reportCode: 'FANAFANA_hpu_health_talks_training_type_setting_map',
    code: 'FANAFANA_hpu_health_talks_training_type_setting',
    dataElements: ['HP281'],
    name: 'Health Talks and Training: Setting Type',
    dataGroups: ['HP07'],
    sortOrder: 1,
  },
  {
    reportCode: 'FANAFANA_hpu_physical_activity_type_setting_map',
    code: 'FANAFANA_hpu_physical_activity_type_setting',
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
          [`=$${dataElements[0]}`]: `= 1`,
          value: `=$${dataElements[0]}`,
        },
      },
      {
        transform: 'mergeRows',
        groupBy: ['organisationUnitCode'],
        using: {
          value: 'unique',
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

const getOverlayObject = (reportCode, code, mapOverlayId, name) => ({
  id: mapOverlayId,
  name,
  code,
  permission_group: PERMISSION_GROUP,
  data_services: [{ isDataRegional: true }],
  legacy: false,
  report_code: reportCode,
  config: {
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
        name: `Church ${reportCode.includes('ncd') ? 'Screenings' : 'Sessions'}`,
        sortOrder: 1,
        values: [
          {
            value: null,
            hideFromPopup: true,
          },
        ],
      },
      Community: {
        name: `Community ${reportCode.includes('ncd') ? 'Screenings' : 'Sessions'}`,
        sortOrder: 2,
        values: [
          {
            value: null,
            hideFromPopup: true,
          },
        ],
      },
      School: {
        name: `School ${reportCode.includes('ncd') ? 'Screenings' : 'Sessions'}`,
        sortOrder: 3,
        values: [
          {
            value: null,
            hideFromPopup: true,
          },
        ],
      },
      Workplace: {
        name: `Workplace ${reportCode.includes('ncd') ? 'Screenings' : 'Sessions'}`,
        sortOrder: 4,
        values: [
          {
            value: null,
            hideFromPopup: true,
          },
        ],
      },
      Total: {
        name: `Total ${reportCode.includes('ncd') ? 'Screenings' : 'Sessions'}`,
        sortOrder: 0,
      },
      $all: {
        type: 'popup-only',
      },
    },
    displayType: 'icon',
    hideFromPopup: true,
  },
  country_codes: '{"TO"}',
  project_codes: '{"fanafana"}',
});

const addMapOverlay = async (db, permissionGroupId, mapOverlayGroupId, config) => {
  const { reportCode, dataElements, code, dataGroups, name, sortOrder } = config;
  const report = getReportObject(reportCode, dataElements, dataGroups);
  const mapOverlayId = generateId();
  const mapOverlay = getOverlayObject(reportCode, code, mapOverlayId, name);
  await insertObject(db, 'report', {
    id: generateId(),
    permission_group_id: permissionGroupId,
    ...report,
  });
  await insertObject(db, 'map_overlay', mapOverlay);
  return insertObject(db, 'map_overlay_group_relation', {
    id: generateId(),
    map_overlay_group_id: mapOverlayGroupId,
    child_id: mapOverlayId,
    child_type: 'mapOverlay',
    sort_order: sortOrder,
  });
};

const removeMapOverlay = (db, reportCode, overlayId) => {
  return db.runSql(`
    DELETE FROM "report" WHERE "code" = '${reportCode}';
    DELETE FROM "map_overlay" WHERE "id" = '${overlayId}';
    DELETE FROM "map_overlay_group_relation" WHERE "child_id" = '${overlayId}';
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
    const mapOverlayId = await codeToId(db, 'map_overlay', code);
    await db.runSql(`
    DELETE FROM "map_overlay_group_relation" WHERE "child_id" = '${mapOverlayId}';
  `);
  }
  // Add new map overlays
  for (const config of NEW_OVERLAY_CONFIGS) {
    await addMapOverlay(db, permissionGroupId, mapOverlayGroupId, config);
  }

  // update group name to 'Health Promotion Unit'
  await updateValues(db, 'map_overlay_group', NEW_GROUP_VALUES, { id: mapOverlayGroupId });
};

exports.down = async function (db) {
  // Remove map overlays
  for (const { reportCode, code } of NEW_OVERLAY_CONFIGS) {
    const overlayId = await codeToId(db, 'map_overlay', code);
    await removeMapOverlay(db, reportCode, overlayId);
  }

  const mapOverlayGroupId = await codeToId(db, 'map_overlay_group', NEW_GROUP_VALUES.code);
  // revert map overlay group to original name and code
  await updateValues(
    db,
    'map_overlay_group',
    { name: 'Fanafana Ola HPU', code: 'Fanafana_Ola_HPU' },
    { id: mapOverlayGroupId },
  );

  // Reinstall legacy overlay relations
  LEGACY_OVERLAY_CODES.forEach(async code => {
    const overlayId = await codeToId(db, 'map_overlay', code);
    await insertObject(db, 'map_overlay_group_relation', {
      id: generateId(),
      map_overlay_group_id: mapOverlayGroupId,
      child_id: overlayId,
      child_type: 'mapOverlay',
    });
  });
};

exports._meta = {
  version: 1,
};
