'use strict';

import { cloneDeep } from 'es-toolkit/compat';
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
  dataElementCode: 'WTHR_FORECAST_PRECIP',
  measureBuilderConfig: {
    entityAggregation: {
      dataSourceEntityType: 'city',
    },
  },
  measureBuilder: 'sumAllPerOrgUnit',
  presentationOptions: {
    scaleType: 'neutral',
    valueType: 'oneDecimalPlace',
    displayType: 'spectrum',
    measureLevel: 'City',
    periodGranularity: 'day',
    isTimePeriodEditable: false,
  },
  countryCodes: '{LA}',
  projectCodes: '{laos_eoc}',
};

const FORECAST_MAP_OVERLAY_7_DAY = cloneDeep(commonMapOverlayConfig);
FORECAST_MAP_OVERLAY_7_DAY.id = 'LA_EOC_Forecast_Rainfall_7_Day_Total';
FORECAST_MAP_OVERLAY_7_DAY.name = 'Forecast rainfall - 7-day total (mm)';
FORECAST_MAP_OVERLAY_7_DAY.presentationOptions = {
  ...commonMapOverlayConfig.presentationOptions,
  datePickerLimits: {
    start: { unit: 'day', offset: 0 },
    end: { unit: 'day', offset: 6 }, // including today is 7 days
  },
  defaultTimePeriod: {
    start: { unit: 'day', offset: 0 },
    end: { unit: 'day', offset: 6 }, // including today is 7 days
  },
};

const FORECAST_MAP_OVERLAY_14_DAY = cloneDeep(commonMapOverlayConfig);
FORECAST_MAP_OVERLAY_14_DAY.id = 'LA_EOC_Forecast_Rainfall_14_Day_Total';
FORECAST_MAP_OVERLAY_14_DAY.name = 'Forecast rainfall - 14-day total (mm)';
FORECAST_MAP_OVERLAY_14_DAY.presentationOptions = {
  ...commonMapOverlayConfig.presentationOptions,
  datePickerLimits: {
    start: { unit: 'day', offset: 0 },
    end: { unit: 'day', offset: 13 }, // including today is 14 days
  },
  defaultTimePeriod: {
    start: { unit: 'day', offset: 0 },
    end: { unit: 'day', offset: 13 }, // including today is 14 days
  },
};

const MAP_OVERLAY_GROUP_RELATIONS = [
  {
    id: generateId(),
    child_id: 'LA_EOC_Forecast_Rainfall_7_Day_Total',
    child_type: 'mapOverlay',
  },
  {
    id: generateId(),
    child_id: 'LA_EOC_Forecast_Rainfall_14_Day_Total',
    child_type: 'mapOverlay',
  },
];

const getMapOverlayGroupId = async db => {
  const results = await db.runSql(
    `SELECT id FROM map_overlay_group WHERE code = 'LA_EOC_Weather_Observations_And_Forecast';`,
  );

  if (results.rows.length > 0) {
    return results.rows[0].id;
  }

  throw new Error('map_overlay_group not found');
};

exports.up = async function (db) {
  const mapOverlayGroupId = await getMapOverlayGroupId(db);

  for (const mapOverlay of [FORECAST_MAP_OVERLAY_7_DAY, FORECAST_MAP_OVERLAY_14_DAY]) {
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
  for (const mapOverlay of [FORECAST_MAP_OVERLAY_7_DAY, FORECAST_MAP_OVERLAY_14_DAY]) {
    await db.runSql(`DELETE FROM "mapOverlay" WHERE id = '${mapOverlay.id}';`);
  }

  for (const mapOverlayGroupRelation of MAP_OVERLAY_GROUP_RELATIONS) {
    await db.runSql(
      `DELETE FROM "map_overlay_group_relation" WHERE child_id = '${mapOverlayGroupRelation.child_id}';`,
    );
  }

  return null;
};

exports._meta = {
  version: 1,
};
