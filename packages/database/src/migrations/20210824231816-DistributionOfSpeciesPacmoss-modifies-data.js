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

const SPECIES = [
  ['Anopheles', 'An_Farauti'],
  ['Anopheles', 'An_Koliensis'],
  ['Anopheles', 'An_Punctulatus'],
  ['Aedes', 'Ae_Aegypti'],
  ['Aedes', 'Ae_Albopictus'],
  ['Aedes', 'Ae_Cooki'],
  ['Aedes', 'Ae_Hensilli'],
  ['Aedes', 'Ae_Marshallensis'],
  ['Aedes', 'Ae_Polynesiensis'],
  ['Aedes', 'Ae_Rotumae'],
  ['Aedes', 'Ae_Scutellaris'],
  ['Aedes', 'Ae_Vigilax'],
  ['Culex', 'Cx_Annulirostris'],
  ['Culex', 'Cx_Quinquefasciatus'],
  ['Culex', 'Cx_Sitiens'],
  ['Mansonia', 'Mn_Uniformis'],
];
const HIERARCHY_LEVELS = ['Country', 'District'];
const PROJECT_CODE = 'pacmossi';
const COUNTRY_CODES = {
  Country: ['pacmossi'],
  District: ['FJ', 'KI', 'NR', 'NU', 'PG', 'SB', 'TV', 'TO', 'VU'],
};
const MAP_OVERLAY_GROUP_CODE = 'Mosquito_occurrence_by_species';
const PERMISSION_GROUP = 'PacMOSSI';

const getReportCode = (species, hierarchyLevel) =>
  `PMOS_Distribution_Of_${species}_${hierarchyLevel}`;

const getReport = (species, hierarchyLevel) => {
  const popupItem = `${species.substr(3)} found`;
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
          insert: {
            value: "=($value > 0) ? 'Detected': 'Not Detected'",
            organisationUnitCode: '=$organisationUnit',
            [popupItem]: '=$value',
          },
          exclude: '*',
          transform: 'updateColumns',
        },
      ],
    },
  };
};

const getMapOverlay = (genus, species, hierarchyLevel) => ({
  id: getReportCode(species, hierarchyLevel),
  name: `Distribution of ${genus} ${species.substr(3).toLowerCase()}`,
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
    hideFromPopup: true,
    hideFromLegend: false,
    measureConfig: {
      $all: {
        type: 'popup-only',
        measureLevel: hierarchyLevel,
      },
    },
  },
  countryCodes: `{${COUNTRY_CODES[hierarchyLevel].map(code => `"${code}"`).join(',')}}`,
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
    SPECIES.map(async ([genus, species], index) => {
      HIERARCHY_LEVELS.map(async hierarchyLevel => {
        // Report
        await insertObject(db, 'report', {
          ...getReport(species, hierarchyLevel),
          permission_group_id: permissionGroupId,
        });

        // Map overlay
        const mapOverlay = getMapOverlay(genus, species, hierarchyLevel);
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

exports.down = async function (db) {
  Promise.all(
    SPECIES.map(async ([_, species]) => {
      HIERARCHY_LEVELS.map(async hierarchyLevel => {
        const mapOverlayIdSlashReportCode = getReportCode(species, hierarchyLevel);
        return db.runSql(`
        DELETE FROM "map_overlay_group_relation" WHERE "child_id" = '${mapOverlayIdSlashReportCode}';
        DELETE FROM "mapOverlay" WHERE "id" = '${mapOverlayIdSlashReportCode}';
        DELETE FROM "report" WHERE code = '${mapOverlayIdSlashReportCode}';
      `);
      });
    }),
  );
};

exports._meta = {
  version: 1,
};
