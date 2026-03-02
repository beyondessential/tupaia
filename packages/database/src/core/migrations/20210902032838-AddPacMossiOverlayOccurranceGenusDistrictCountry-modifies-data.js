'use strict';

import { insertObject, generateId, findSingleRecordBySql, codeToId } from '../utilities';

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
const HIERARCHIES = ['Country', 'District'];
const PROJECT_CODE = 'pacmossi';
const COUNTRY_CODES = {
  Country: ['pacmossi'],
  District: ['FJ', 'KI', 'NR', 'NU', 'PG', 'SB', 'TV', 'TO', 'VU'],
};
const MAP_OVERLAY_GROUP_CODE = 'Mosquito_occurrence_by_genus';
const PERMISSION_GROUP = 'PacMOSSI';

const getReportCode = (species, hierarchyLevel) =>
  `PMOS_Distribution_Of_${species}_${hierarchyLevel}`;

const getReport = (species, hierarchyLevel) => {
  const popupItem = `'${species} found'`;
  return {
    id: generateId(),
    code: getReportCode(species, hierarchyLevel),
    config: {
      fetch: {
        aggregations: [
          {
            type: 'SUM_PER_ORG_GROUP',
            config: {
              dataSourceEntityType: 'field_station',
              aggregationEntityType: hierarchyLevel.toLowerCase(),
            },
          },
        ],
        dataElements: [`PMOS_${species}`],
      },
      transform: [
        {
          transform: 'select',
          [popupItem]: '$row.value',
          "'value'": "($row.value > 0) ? 'Detected': 'Not Detected'", // null > 0 = false, interesting.
          "'organisationUnitCode'": '$row.organisationUnit',
        },
      ],
    },
  };
};

const getMapOverlay = (species, hierarchyLevel) => ({
  id: getReportCode(species, hierarchyLevel),
  name: `Distribution of ${species} (${hierarchyLevel.toLowerCase()})`,
  userGroup: PERMISSION_GROUP,
  dataElementCode: 'value',
  isDataRegional: true,
  measureBuilder: 'useReportServer',
  measureBuilderConfig: {
    dataSourceType: 'custom',
    reportCode: getReportCode(species, hierarchyLevel),
  },
  presentationOptions: {
    values: [
      {
        name: 'Detected',
        value: 'Detected',
        color: 'Red',
      },
      {
        name: 'Not Detected',
        value: 'Not Detected',
        color: 'Blue',
      },
      {
        name: 'No data',
        color: 'Grey',
        value: 'null',
      },
    ],
    displayType: 'shading',
    measureLevel: hierarchyLevel,
    hideFromLegend: false,
    hideFromPopup: true,
    measureConfig: {
      $all: {
        type: 'popup-only',
        measureLevel: hierarchyLevel,
      },
    },
  },
  countryCodes: `{${COUNTRY_CODES[hierarchyLevel].flat().join(', ')}}`,
  projectCodes: `{${PROJECT_CODE}}`,
});

const permissionGroupNameToId = async (db, name) => {
  const record = await db.runSql(`SELECT id FROM permission_group WHERE name = '${name}'`);
  return record.rows[0] && record.rows[0].id;
};
exports.up = async function (db) {
  const mapOverlayGroupId = await codeToId(db, 'map_overlay_group', MAP_OVERLAY_GROUP_CODE);
  const permissionGroupId = await permissionGroupNameToId(db, PERMISSION_GROUP);
  const maxSortOrder = (
    await findSingleRecordBySql(
      db,
      `SELECT max(sort_order) as max_sort_order FROM map_overlay_group_relation WHERE map_overlay_group_id = '${mapOverlayGroupId}';`,
    )
  ).max_sort_order;

  await Promise.all(
    SPECIES.map(async (species, index) => {
      HIERARCHIES.map(async hierarchyLevel => {
        // Report
        await insertObject(db, 'report', {
          ...getReport(species, hierarchyLevel),
          permission_group_id: permissionGroupId,
        });

        // Map overlay
        const mapOverlay = getMapOverlay(species, hierarchyLevel);
        await insertObject(db, 'mapOverlay', mapOverlay);

        await insertObject(db, 'map_overlay_group_relation', {
          id: generateId(),
          map_overlay_group_id: mapOverlayGroupId,
          child_id: mapOverlay.id,
          child_type: 'mapOverlay',
          sort_order: maxSortOrder === null ? index : maxSortOrder + index,
        });
      });
    }),
  );
};

const removeMapOverlayAndReport = async (db, code) => {
  await db.runSql(`DELETE FROM "map_overlay_group_relation" WHERE "child_id" = '${code}';`);
  await db.runSql(`DELETE FROM "mapOverlay" WHERE "id" = '${code}';`);
  await db.runSql(`DELETE FROM "report" WHERE code = '${code}';`);
};

exports.down = async function (db) {
  for (const specie of SPECIES) {
    for (const hierarchyLevel of HIERARCHIES) {
      const mapOverlayIdSlashReportCode = getReportCode(specie, hierarchyLevel);
      await removeMapOverlayAndReport(db, mapOverlayIdSlashReportCode);
    }
  }
};

exports._meta = {
  version: 1,
};
