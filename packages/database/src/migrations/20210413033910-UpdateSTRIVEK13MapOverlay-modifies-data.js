'use strict';

import { insertObject } from '../utilities';
import { generateId } from '../utilities/generateId';

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

const NEW_OVERLAY_GROUP_RELATION_FOR_OVERLAY_ID = generateId();

const NEW_TOTAL_SAMPLES_MAP_OVERLAY = {
  userGroup: 'STRIVE User',
  dataElementCode: 'value',
  isDataRegional: true,
  measureBuilderConfig: {
    dataValues: {
      STR_K13C06: 1,
    },
    programCode: 'SK13C',
    entityAggregation: {
      aggregationType: 'REPLACE_ORG_UNIT_WITH_ORG_GROUP',
      dataSourceEntityType: 'case',
      aggregationEntityType: 'facility',
    },
  },
  measureBuilder: 'countEventsPerOrgUnit',
  countryCodes: '{PG}',
  projectCodes: '{strive,explore}',
  id: 'PG_STRIVE_Total_samples_sequenced',
  name: 'Total K13 samples successfully sequenced',
  presentationOptions: {
    values: [
      {
        name: 'Samples successfully sequenced',
        color: 'green',
        value: 'other',
      },
      {
        name: 'No samples successfully sequenced',
        color: 'red',
        value: '0',
      },
      {
        name: 'No data',
        color: 'grey',
        value: null,
      },
    ],
    measureLevel: 'Facility',
  },
};

const GROUP_RELATION_FOR_TOTAL_SAMPLES_OVERLAY = {
  id: `${NEW_OVERLAY_GROUP_RELATION_FOR_OVERLAY_ID}`,
  map_overlay_group_id: '601c731e61f76a4b9c000001',
  child_id: `${NEW_TOTAL_SAMPLES_MAP_OVERLAY.id}`,
  child_type: 'mapOverlay',
  sort_order: '0',
};

const NEW_MEASURE_BUILDER_CONFIG = {
  dataValues: {
    STR_K13C07: {
      value: 'C580Y',
      operator: 'regex',
    },
  },
  programCode: 'SK13C',
  entityAggregation: {
    aggregationType: 'REPLACE_ORG_UNIT_WITH_ORG_GROUP',
    dataSourceEntityType: 'case',
    aggregationEntityType: 'facility',
  },
};

const NEW_PRESENTATION_OPTIONS = {
  values: [
    {
      name: 'Positive C580Y result',
      color: 'red',
      value: 'other',
      hideFromPopup: true,
    },
    {
      name: 'Positive other/wildtype result',
      color: 'green',
      value: '0',
      hideFromPopup: true,
    },
    {
      name: 'No data',
      color: 'grey',
      value: null,
      hideFromPopup: true,
    },
  ],
  displayType: 'color',
  measureLevel: 'Facility',
};

const NEW_MEASURE_BUILDER_CONFIG_COUNT = {
  dataValues: {
    STR_K13C07: {
      value: 'C580Y',
      operator: 'regex',
    },
  },
  programCode: 'SK13C',
  entityAggregation: {
    aggregationType: 'REPLACE_ORG_UNIT_WITH_ORG_GROUP',
    dataSourceEntityType: 'case',
    aggregationEntityType: 'facility',
  },
};

const NEW_PRESENTATION_OPTIONS_COUNT = {
  values: [
    {
      color: 'red',
      value: 'other',
      hideFromLegend: true,
    },
    {
      color: 'green',
      value: '0',
      hideFromLegend: true,
    },
    {
      color: 'grey',
      value: null,
      hideFromLegend: true,
    },
  ],
  displayType: 'color',
  measureLevel: 'Facility',
};

const OLD_MEASURE_BUILDER_CONFIG = {
  dataValues: {
    STR_K13C05: 1,
  },
  programCode: 'SK13C',
  entityAggregation: {
    aggregationType: 'REPLACE_ORG_UNIT_WITH_ORG_GROUP',
    dataSourceEntityType: 'case',
    aggregationEntityType: 'facility',
  },
};

const OLD_PRESENTATION_OPTIONS = {
  values: [
    {
      name: 'Positive result',
      color: 'green',
      value: 'other',
      hideFromPopup: true,
    },
    {
      name: 'No positive result',
      color: 'red',
      value: '0',
      hideFromPopup: true,
    },
    {
      name: 'No data',
      color: 'grey',
      value: null,
      hideFromPopup: true,
    },
  ],
  displayType: 'color',
  measureLevel: 'Facility',
};

const OLD_COUNT_MEASURE_BUILDER_CONFIG = {
  dataValues: {
    STR_K13C05: 1,
  },
  programCode: 'SK13C',
  entityAggregation: {
    aggregationType: 'REPLACE_ORG_UNIT_WITH_ORG_GROUP',
    dataSourceEntityType: 'case',
    aggregationEntityType: 'facility',
  },
};

const OLD_COUNT_PRESENTATION_OPTIONS = {
  values: [
    {
      value: 'other',
      hideFromLegend: true,
      color: 'green',
    },
    {
      value: '0',
      hideFromLegend: true,
      color: 'red',
    },
    {
      value: null,
      hideFromLegend: true,
      color: 'grey',
    },
  ],
  displayType: 'color',
  measureLevel: 'Facility',
};

exports.up = async function (db) {
  await insertObject(db, 'mapOverlay', NEW_TOTAL_SAMPLES_MAP_OVERLAY);
  await insertObject(db, 'map_overlay_group_relation', GROUP_RELATION_FOR_TOTAL_SAMPLES_OVERLAY);
  await db.runSql(`
    UPDATE "mapOverlay"
    SET "measureBuilderConfig" = '${JSON.stringify(NEW_MEASURE_BUILDER_CONFIG)}'::jsonb
    WHERE "id" = 'PG_STRIVE_K13_C580Y_Positive';
  `);
  await db.runSql(`
    UPDATE "mapOverlay"
    SET "presentationOptions" = '${JSON.stringify(NEW_PRESENTATION_OPTIONS)}'::jsonb
    WHERE "id" = 'PG_STRIVE_K13_C580Y_Positive';
  `);
  await db.runSql(`
    UPDATE "mapOverlay"
    SET "measureBuilderConfig" = '${JSON.stringify(NEW_MEASURE_BUILDER_CONFIG_COUNT)}'::jsonb
    WHERE "id" = 'PG_STRIVE_K13_C580Y_Positive_Count';
  `);
  await db.runSql(`
    UPDATE "mapOverlay"
    SET "presentationOptions" = '${JSON.stringify(NEW_PRESENTATION_OPTIONS_COUNT)}'::jsonb
    WHERE "id" = 'PG_STRIVE_K13_C580Y_Positive_Count';
  `);
};

exports.down = async function (db) {
  await db.runSql(`
    DELETE FROM "mapOverlay"
    WHERE "id" = '${NEW_TOTAL_SAMPLES_MAP_OVERLAY.id}';
  `);
  await db.runSql(`
    DELETE FROM "map_overlay_group_relation" WHERE "child_id" = '${NEW_TOTAL_SAMPLES_MAP_OVERLAY.id}';
  `);
  await db.runSql(`
    UPDATE "mapOverlay"
    SET "measureBuilderConfig" = '${JSON.stringify(OLD_MEASURE_BUILDER_CONFIG)}'::jsonb
    WHERE "id" = 'PG_STRIVE_K13_C580Y_Positive';
  `);
  await db.runSql(`
    UPDATE "mapOverlay"
    SET "presentationOptions" = '${JSON.stringify(OLD_PRESENTATION_OPTIONS)}'::jsonb
    WHERE "id" = 'PG_STRIVE_K13_C580Y_Positive';
  `);
  await db.runSql(`
    UPDATE "mapOverlay"
    SET "measureBuilderConfig" = '${JSON.stringify(OLD_COUNT_MEASURE_BUILDER_CONFIG)}'::jsonb
    WHERE "id" = 'PG_STRIVE_K13_C580Y_Positive_Count';
  `);
  await db.runSql(`
    UPDATE "mapOverlay"
    SET "presentationOptions" = '${JSON.stringify(OLD_COUNT_PRESENTATION_OPTIONS)}'::jsonb
    WHERE "id" = 'PG_STRIVE_K13_C580Y_Positive_Count';
  `);
};

exports._meta = {
  version: 1,
};
