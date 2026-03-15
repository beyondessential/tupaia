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

const MAP_OVERLAY_GROUP_CODE = 'LA_EOC_Weather_Observations_And_Forecast';

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
        offset: 15, // limit of api is 16 days including today, i.e. +15
      },
      start: {
        unit: 'day',
        offset: 0, // today
      },
    },
    defaultTimePeriod: {
      unit: 'day',
      offset: 0, // default date is today
    },
  },
  countryCodes: '{LA}',
  projectCodes: '{laos_eoc}',
};

const FORECAST_MAP_OVERLAYS = [
  {
    ...commonMapOverlayConfig,
    id: 'LA_EOC_Forecast_Rainfall',
    name: 'Forecast rainfall (mm)',
    dataElementCode: 'WTHR_FORECAST_PRECIP',
  },
  {
    ...commonMapOverlayConfig,
    id: 'LA_EOC_Forecast_Min_Temp',
    name: 'Forecast minimum temperature (°C)',
    dataElementCode: 'WTHR_FORECAST_MIN_TEMP',
  },
  {
    ...commonMapOverlayConfig,
    id: 'LA_EOC_Forecast_Max_Temp',
    name: 'Forecast maximum temperature (°C)',
    dataElementCode: 'WTHR_FORECAST_MAX_TEMP',
  },
];

const MAP_OVERLAY_GROUP_RELATIONS = [
  {
    id: generateId(),
    child_id: 'LA_EOC_Forecast_Rainfall',
    child_type: 'mapOverlay',
  },
  {
    id: generateId(),
    child_id: 'LA_EOC_Forecast_Min_Temp',
    child_type: 'mapOverlay',
  },
  {
    id: generateId(),
    child_id: 'LA_EOC_Forecast_Max_Temp',
    child_type: 'mapOverlay',
  },
];

const getMapOverlayGroupId = async db => {
  const results = await db.runSql(
    `SELECT id FROM map_overlay_group WHERE code = '${MAP_OVERLAY_GROUP_CODE}';`,
  );

  if (results.rows.length > 0) {
    return results.rows[0].id;
  }

  throw new Error('Not found');
};

exports.up = async function (db) {
  const mapOverlayGroupId = await getMapOverlayGroupId(db);

  for (const mapOverlay of FORECAST_MAP_OVERLAYS) {
    await insertObject(db, 'mapOverlay', mapOverlay);
  }

  for (const mapOverlayGroupRelation of MAP_OVERLAY_GROUP_RELATIONS) {
    const data = {
      ...mapOverlayGroupRelation,
      map_overlay_group_id: mapOverlayGroupId,
    };
    await insertObject(db, 'map_overlay_group_relation', data);
  }

  return null;
};

exports.down = async function (db) {
  for (const mapOverlayGroupRelation of MAP_OVERLAY_GROUP_RELATIONS) {
    await db.runSql(
      `DELETE FROM "map_overlay_group_relation" WHERE child_id = '${mapOverlayGroupRelation.child_id}';`,
    );
  }

  for (const mapOverlay of FORECAST_MAP_OVERLAYS) {
    await db.runSql(`DELETE FROM "mapOverlay" WHERE id = '${mapOverlay.id}';`);
  }

  return null;
};

exports._meta = {
  version: 1,
};
