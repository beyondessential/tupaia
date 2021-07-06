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

const MAP_OVERLAY = {
  id: 'PG_Strive_Mosquito_Species',
  name: 'Mosquito species',
  userGroup: 'STRIVE User',
  dataElementCode: 'value',
  isDataRegional: true,
  measureBuilder: 'useReportServer',
  measureBuilderConfig: {
    dataSourceType: 'custom',
    reportCode: 'PG_Strive_Mosquito_Species_MapOverlay',
  },
  presentationOptions: {
    values: [
      {
        icon: 'circle',
        name: 'Mosquito species',
        value: 'exists', // Just a tag to indicate we have data
        hideFromLegend: false,
      },
    ],
    displayType: 'icon',
    measureLevel: 'Facility',
    hideFromPopup: true,
    measureConfig: {
      $all: {
        type: 'icon',
        values: [
          {
            icon: 'circle',
            value: 'other',
            hideFromLegend: true,
          },
          {
            icon: 'circle',
            name: 'No data',
            color: 'Grey',
            value: 'null',
            hideFromLegend: true,
            hideFromPopup: true,
          },
        ],
        measureLevel: 'Facility',
      },
    },
  },
  countryCodes: '{"PG"}',
  projectCodes: '{strive}',
};

const getMapOverlayGroupId = async function (db, code) {
  const results = await db.runSql(`select "id" from "map_overlay_group" where "code" = '${code}';`);

  if (results.rows.length > 0) {
    return results.rows[0].id;
  }

  throw new Error('MapOverlayGroup not found');
};

const mapOverlayGroupRelation = groupId => ({
  id: generateId(),
  map_overlay_group_id: groupId,
  child_id: MAP_OVERLAY.id,
  child_type: 'mapOverlay',
  sort_order: 0,
});

const MAP_OVERLAY_GROUP_CODE = 'STRIVE_Vector_Data';

exports.up = async function (db) {
  await insertObject(db, 'mapOverlay', MAP_OVERLAY);
  const mapOverlayGroupId = await getMapOverlayGroupId(db, MAP_OVERLAY_GROUP_CODE);
  await insertObject(db, 'map_overlay_group_relation', mapOverlayGroupRelation(mapOverlayGroupId));
};

exports.down = function (db) {
  return db.runSql(`
    delete from "map_overlay_group_relation" where "child_id" = '${MAP_OVERLAY.id}';
    delete from "mapOverlay" where "id" = '${MAP_OVERLAY.id}';
  `);
};

exports._meta = {
  version: 1,
};
