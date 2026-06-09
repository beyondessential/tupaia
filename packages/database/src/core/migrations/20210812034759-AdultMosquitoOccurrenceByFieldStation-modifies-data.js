'use strict';

import { insertObject, generateId, codeToId } from '../utilities';

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
const SPECIES = ['Aedes', 'Anopheles'];

const getReportCode = species => `PMOS_Distribution_Of_${species}_Field_Station`;
const COUNTRY_CODES = ['FJ', 'KI', 'NR', 'NU', 'PG', 'SB', 'TV', 'TO', 'VU'];
const PERMISSION_GROUP = 'PacMOSSI';
const PROJECT_CODE = 'pacmossi';
const MAP_OVERLAY_GROUP_CODE = 'Mosquito_occurrence_by_genus';

const getReport = species => {
  const popupItem = `'Total ${species} Mosquitoes found:'`;
  return {
    id: generateId(),
    code: getReportCode(species),
    config: {
      fetch: {
        aggregations: [
          {
            type: 'SUM_PER_ORG_GROUP',
            config: {
              dataSourceEntityType: 'field_station',
            },
          },
        ],
        dataElements: [`PMOS_${species}`],
      },
      transform: [
        {
          transform: 'select',
          [popupItem]: '$row.value',
          "'value'": "($row.value >0) ? 'Detected': 'Not Detected'", // null > 0 = false, interesting.
          "'organisationUnitCode'": '$row.organisationUnit',
        },
      ],
    },
  };
};

const getMapOverlay = species => ({
  id: getReportCode(species),
  name: `Distribution of ${species} (field station)`,
  userGroup: PERMISSION_GROUP,
  dataElementCode: 'value',
  isDataRegional: true,
  measureBuilder: 'useReportServer',
  measureBuilderConfig: {
    dataSourceType: 'custom',
    reportCode: getReportCode(species),
  },
  presentationOptions: {
    values: [
      {
        icon: 'circle',
        name: 'Detected',
        value: 'Detected',
        color: 'Red',
        hideFromLegend: false,
        hideFromPopup: true,
      },
      {
        icon: 'circle',
        name: 'Not Detected',
        value: 'Not Detected',
        color: 'Blue',
        hideFromLegend: false,
        hideFromPopup: true,
      },
      {
        icon: 'circle',
        name: 'No data',
        color: 'Grey',
        value: 'null',
        hideFromLegend: false,
        hideFromPopup: true,
      },
    ],
    displayType: 'icon',
    measureLevel: 'FieldStation',
    hideFromPopup: true,
    measureConfig: {
      $all: {
        type: 'popup-only',
        measureLevel: 'FieldStation',
      },
    },
  },
  countryCodes: `{${COUNTRY_CODES.map(code => `"${code}"`).join(',')}}`,
  projectCodes: `{${PROJECT_CODE}}`,
});

const permissionGroupNameToId = async (db, name) => {
  const record = await db.runSql(`SELECT id FROM permission_group WHERE name = '${name}'`);
  return record.rows[0] && record.rows[0].id;
};

exports.up = async function (db) {
  const mapOverlayGroupId = generateId();
  const permissionGroupId = await permissionGroupNameToId(db, PERMISSION_GROUP);

  // Map overlay group
  await insertObject(db, 'map_overlay_group', {
    id: mapOverlayGroupId,
    name: 'Mosquito occurrence by genus',
    code: MAP_OVERLAY_GROUP_CODE,
  });
  const rootMapOverlayGroupId = await codeToId(db, 'map_overlay_group', 'Root');
  await insertObject(db, 'map_overlay_group_relation', {
    id: generateId(),
    map_overlay_group_id: rootMapOverlayGroupId,
    child_id: mapOverlayGroupId,
    child_type: 'mapOverlayGroup',
    sort_order: 0,
  });

  Promise.all(
    SPECIES.map(async (species, index) => {
      // report
      await insertObject(db, 'report', {
        ...getReport(species),
        permission_group_id: permissionGroupId,
      });

      // Map overlay
      const mapOverlay = getMapOverlay(species);
      await insertObject(db, 'mapOverlay', mapOverlay);
      await insertObject(db, 'map_overlay_group_relation', {
        id: generateId(),
        map_overlay_group_id: mapOverlayGroupId,
        child_id: mapOverlay.id,
        child_type: 'mapOverlay',
        sort_order: index,
      });
    }),
  );
};

exports.down = function (db) {
  Promise.all(
    SPECIES.map(async species => {
      const mapOverlayId = getReportCode(species);
      return db.runSql(`
        DELETE FROM "map_overlay_group_relation" WHERE "child_id" = '${mapOverlayId}';
        DELETE FROM "mapOverlay" WHERE "id" = '${mapOverlayId}';
        DELETE FROM "report" WHERE code = '${getReportCode(species)}';
      `);
    }),
  );
  return db.runSql(`
    DELETE FROM "map_overlay_group" WHERE "code" = '${MAP_OVERLAY_GROUP_CODE}';
  `);
};

exports._meta = {
  version: 1,
};
