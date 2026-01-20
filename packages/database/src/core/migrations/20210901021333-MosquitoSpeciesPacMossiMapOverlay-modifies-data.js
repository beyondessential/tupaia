'use strict';

import { insertObject, generateId, findSingleRecordBySql } from '../utilities';

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

const reportCode = 'PacMosssi_Mosquito_Species_District';

const MAP_OVERLAY = {
  id: reportCode,
  name: 'Mosquito species',
  userGroup: 'PacMOSSI',
  dataElementCode: 'value',
  isDataRegional: true,
  measureBuilder: 'useReportServer',
  measureBuilderConfig: {
    dataSourceType: 'custom',
    reportCode,
  },
  presentationOptions: {
    values: [
      {
        name: 'Mosquito species',
        color: 'blue',
        value: 'exists',
        hideFromLegend: false,
      },
      {
        color: 'transparent',
        value: null,
        hideFromLegend: true,
      },
    ],
    displayType: 'shading',
    measureLevel: 'District',
    hideFromPopup: true,
    measureConfig: {
      $all: {
        type: 'popup-only',
        values: [
          {
            value: null,
            hideFromPopup: true,
          },
        ],
        measureLevel: 'District',
      },
    },
  },
  countryCodes: '{"FJ","KI","NU","NR","PG","SB","TO","TV","VU"}',
  projectCodes: '{pacmossi}',
};

const getMapOverlayGroupId = async function (db, code) {
  const results = await db.runSql(`select "id" from "map_overlay_group" where "code" = '${code}';`);

  if (results.rows.length > 0) {
    return results.rows[0].id;
  }

  throw new Error('MapOverlayGroup not found');
};

const mapOverlayGroupRelation = (groupId, maxSortOrder) => ({
  id: generateId(),
  map_overlay_group_id: groupId,
  child_id: MAP_OVERLAY.id,
  child_type: 'mapOverlay',
  sort_order: maxSortOrder,
});

const MAP_OVERLAY_GROUP_CODE = 'Mosquito_occurrence_by_genus';

exports.up = async function (db) {
  await insertObject(db, 'mapOverlay', MAP_OVERLAY);
  const mapOverlayGroupId = await getMapOverlayGroupId(db, MAP_OVERLAY_GROUP_CODE);
  const maxSortOrder = (
    await findSingleRecordBySql(
      db,
      `SELECT max(sort_order) as max_sort_order FROM map_overlay_group_relation WHERE map_overlay_group_id = '${mapOverlayGroupId}';`,
    )
  ).max_sort_order;
  await insertObject(
    db,
    'map_overlay_group_relation',
    mapOverlayGroupRelation(mapOverlayGroupId, maxSortOrder),
  );
};

exports.down = async function (db) {
  return db.runSql(`
    delete from "map_overlay_group_relation" where "child_id" = '${MAP_OVERLAY.id}';
    delete from "mapOverlay" where "id" = '${MAP_OVERLAY.id}';
  `);
};

exports._meta = {
  version: 1,
};
