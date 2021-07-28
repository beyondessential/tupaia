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
  id: 'AU_Flutracking_Postcode_Fever_Percent',
  name: '% fever and cough by postcode',
  userGroup: 'Public',
  dataElementCode: 'value',
  isDataRegional: true,
  measureBuilder: 'useReportServer',
  measureBuilderConfig: {
    dataSourceType: 'custom',
    reportCode: 'AU_Flutracking_Postcode_Percent_Report',
  },
  presentationOptions: {
    hideByDefault: {
      null: true,
    },
    icon: 'circle',
    displayType: 'spectrum',
    measureLevel: 'Postcode',
    valueType: 'percentage',
    scaleType: 'performance',
    scaleColorScheme: 'default',
    hideFromPopup: false,
    hideFromMenu: false,
    hideFromLegend: false,
    linkedMeasures: null,
    periodGranularity: 'one_week_at_a_time',
    scaleBounds: {
      right: {
        max: 0.05,
      },
    },
    measureConfig: {
      $all: {
        type: 'popup-only',
        hideFromLegend: true,
        measureLevel: 'Postcode',
      },
    },
  },
  countryCodes: '{"AU"}',
  projectCodes: '{covidau}',
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

const MAP_OVERLAY_GROUP_CODE = 'Flutracking_Australia';

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
