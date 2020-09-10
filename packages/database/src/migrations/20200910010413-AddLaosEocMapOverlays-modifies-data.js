'use strict';

import { generateId, insertObject } from '../utilities';

var dbm;
var type;
var seed;

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

const MAP_OVERLAY_GROUP = {
  id: generateId(),
  name: 'Weather Observations',
  code: 'LA_EOC_Weather_Observations',
};

const commonMapOverlayConfig = {
  userGroup: 'Laos EOC User',
  measureBuilderConfig: {
    entityAggregation: {
      dataSourceEntityType: 'city',
    },
  },
  measureBuilder: 'valueForOrgGroup',
  presentationOptions: {
    scaleType: 'neutral',
    valueType: 'oneDecimalPlace',
    displayType: 'spectrum',
    measureLevel: 'City',
  },
  countryCodes: '{LA}',
  projectCodes: '{laos_eoc}',
};

const MAP_OVERLAYS = [
  {
    ...commonMapOverlayConfig,
    id: 'LA_EOC_Current_Precip',
    name: 'Daily rainfall (mm)',
    dataElementCode: 'PRECIP',
  },
  {
    ...commonMapOverlayConfig,
    id: 'LA_EOC_Current_Min_Temp',
    name: 'Daily minimum temperature (°C)',
    dataElementCode: 'MIN_TEMP',
  },
  {
    ...commonMapOverlayConfig,
    id: 'LA_EOC_Current_Max_Temp',
    name: 'Daily maximum temperature (°C)',
    dataElementCode: 'MAX_TEMP',
  },
];

const MAP_OVERLAY_GROUP_RELATIONS = [
  {
    id: generateId(),
    map_overlay_group_id: MAP_OVERLAY_GROUP.id,
    child_id: 'LA_EOC_Current_Precip',
    child_type: 'mapOverlay',
  },
  {
    id: generateId(),
    map_overlay_group_id: MAP_OVERLAY_GROUP.id,
    child_id: 'LA_EOC_Current_Min_Temp',
    child_type: 'mapOverlay',
  },
  {
    id: generateId(),
    map_overlay_group_id: MAP_OVERLAY_GROUP.id,
    child_id: 'LA_EOC_Current_Max_Temp',
    child_type: 'mapOverlay',
  },
];

exports.up = async function(db) {
  await insertObject(db, 'map_overlay_group', MAP_OVERLAY_GROUP);

  for (const mapOverlay of MAP_OVERLAYS) {
    await insertObject(db, 'mapOverlay', mapOverlay);
  }

  for (const mapOverlayGroupRelation of MAP_OVERLAY_GROUP_RELATIONS) {
    await insertObject(db, 'map_overlay_group_relation', mapOverlayGroupRelation);
  }

  return null;
};

exports.down = async function(db) {
  for (const mapOverlayGroupRelation of MAP_OVERLAY_GROUP_RELATIONS) {
    await db.runSql(
      `DELETE FROM "map_overlay_group_relation" WHERE child_id = '${mapOverlayGroupRelation.child_id}';`,
    );
  }

  await db.runSql(`DELETE FROM "map_overlay_group" WHERE code = '${MAP_OVERLAY_GROUP.code}';`);

  for (const mapOverlay of MAP_OVERLAYS) {
    await db.runSql(`DELETE FROM "mapOverlay" WHERE id = '${mapOverlay.id}';`);
  }

  return null;
};

exports._meta = {
  version: 1,
};
