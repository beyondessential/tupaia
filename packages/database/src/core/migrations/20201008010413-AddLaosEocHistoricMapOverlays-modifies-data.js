'use strict';

import { generateId, insertObject } from '../utilities';

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

const MAP_OVERLAY_GROUP = {
  id: generateId(),
  name: 'Weather Observations/Forecast',
  code: 'LA_EOC_Weather_Observations_And_Forecast',
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
    periodGranularity: 'one_day_at_a_time',
    datePickerLimits: {
      end: {
        unit: 'day',
        offset: -1, // yesterday
      },
      start: {
        unit: 'day',
        offset: -365, // one year ago
      },
    },
    defaultTimePeriod: {
      unit: 'day',
      offset: -1, // default date is yesterday
    },
  },
  countryCodes: '{LA}',
  projectCodes: '{laos_eoc}',
};

const HISTORIC_MAP_OVERLAYS = [
  {
    ...commonMapOverlayConfig,
    id: 'LA_EOC_Observed_Rainfall',
    name: 'Observed rainfall (mm)',
    dataElementCode: 'WTHR_PRECIP',
  },
  {
    ...commonMapOverlayConfig,
    id: 'LA_EOC_Observed_Min_Temp',
    name: 'Observed minimum temperature (°C)',
    dataElementCode: 'WTHR_MIN_TEMP',
  },
  {
    ...commonMapOverlayConfig,
    id: 'LA_EOC_Observed_Max_Temp',
    name: 'Observed maximum temperature (°C)',
    dataElementCode: 'WTHR_MAX_TEMP',
  },
];

const MAP_OVERLAY_GROUP_RELATIONS = [
  {
    id: generateId(),
    map_overlay_group_id: MAP_OVERLAY_GROUP.id,
    child_id: 'LA_EOC_Observed_Rainfall',
    child_type: 'mapOverlay',
  },
  {
    id: generateId(),
    map_overlay_group_id: MAP_OVERLAY_GROUP.id,
    child_id: 'LA_EOC_Observed_Min_Temp',
    child_type: 'mapOverlay',
  },
  {
    id: generateId(),
    map_overlay_group_id: MAP_OVERLAY_GROUP.id,
    child_id: 'LA_EOC_Observed_Max_Temp',
    child_type: 'mapOverlay',
  },
];

const getMapOverlayGroupId = async function (db, name) {
  const results = await db.runSql(`SELECT id FROM map_overlay_group WHERE name = '${name}';`);

  if (results.rows.length > 0) {
    return results.rows[0].id;
  }

  throw new Error('MapOverlayGroup not found');
};

exports.up = async function (db) {
  await insertObject(db, 'map_overlay_group', MAP_OVERLAY_GROUP);

  for (const mapOverlay of HISTORIC_MAP_OVERLAYS) {
    await insertObject(db, 'mapOverlay', mapOverlay);
  }

  for (const mapOverlayGroupRelation of MAP_OVERLAY_GROUP_RELATIONS) {
    await insertObject(db, 'map_overlay_group_relation', mapOverlayGroupRelation);
  }

  const rootMapOverlayGroupId = await getMapOverlayGroupId(db, 'Root');

  await insertObject(db, 'map_overlay_group_relation', {
    id: generateId(),
    map_overlay_group_id: rootMapOverlayGroupId,
    child_id: MAP_OVERLAY_GROUP.id,
    child_type: 'mapOverlayGroup',
  });

  return null;
};

exports.down = async function (db) {
  for (const mapOverlayGroupRelation of MAP_OVERLAY_GROUP_RELATIONS) {
    await db.runSql(
      `DELETE FROM "map_overlay_group_relation" WHERE child_id = '${mapOverlayGroupRelation.child_id}';`,
    );
  }

  const mapOverlayGroupId = await getMapOverlayGroupId(db, MAP_OVERLAY_GROUP.name);

  await db.runSql(
    `DELETE FROM map_overlay_group_relation WHERE child_id = '${mapOverlayGroupId}';`,
  );

  await db.runSql(`DELETE FROM "map_overlay_group" WHERE code = '${MAP_OVERLAY_GROUP.code}';`);

  for (const mapOverlay of HISTORIC_MAP_OVERLAYS) {
    await db.runSql(`DELETE FROM "mapOverlay" WHERE id = '${mapOverlay.id}';`);
  }

  return null;
};

exports._meta = {
  version: 1,
};
