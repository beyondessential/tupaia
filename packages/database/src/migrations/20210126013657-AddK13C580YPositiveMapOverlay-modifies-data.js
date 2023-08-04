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

const MAIN_OVERLAY_ID = 'PG_STRIVE_K13_C580Y_Positive';
const LINKED_MEASURE_OVERLAY_ID = 'PG_STRIVE_K13_C580Y_Positive_Count';
const NEW_OVERLAY_GROUP_ID = generateId();
const NEW_OVERLAY_GROUP_RELATION_FOR_OVERLAY_ID = generateId();
const NEW_OVERLAY_GROUP_RELATION_FOR_GROUP_ID = generateId();

// the below object contains common properties across the two overlays that will be created

const BASE_OVERLAY = {
  userGroup: 'STRIVE User',
  dataElementCode: 'value',
  isDataRegional: true,
  measureBuilderConfig: {
    dataValues: {
      STR_K13C05: 1,
    },
    programCode: 'SK13C',
    entityAggregation: {
      aggregationType: 'REPLACE_ORG_UNIT_WITH_ORG_GROUP',
      dataSourceEntityType: 'village',
      aggregationEntityType: 'facility',
    },
  },
  measureBuilder: 'countEventsPerOrgUnit',
  countryCodes: '{PG}',
  projectCodes: '{strive,explore}',
};

const LINKED_MEASURE_OVERLAY = {
  ...BASE_OVERLAY,
  id: `${LINKED_MEASURE_OVERLAY_ID}`,
  name: 'K13 C580Y Positive Count',
  presentationOptions: {
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
  },
};

const MAIN_OVERLAY = {
  ...BASE_OVERLAY,
  id: `${MAIN_OVERLAY_ID}`,
  name: 'K13 C580Y Positive',
  linkedMeasures: `{${LINKED_MEASURE_OVERLAY_ID}}`,
  presentationOptions: {
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
  },
};

const NEW_OVERLAY_GROUP = {
  id: `${NEW_OVERLAY_GROUP_ID}`,
  name: 'STRIVE Molecular Data',
  code: 'STRIVE_Molecular_Data',
};

const NEW_OVERLAY_GROUP_RELATION_FOR_OVERLAY = {
  id: `${NEW_OVERLAY_GROUP_RELATION_FOR_OVERLAY_ID}`,
  map_overlay_group_id: `${NEW_OVERLAY_GROUP_ID}`,
  child_id: `${MAIN_OVERLAY_ID}`,
  child_type: 'mapOverlay',
  sort_order: '0',
};

const NEW_OVERLAY_GROUP_RELATION_FOR_GROUP = {
  id: `${NEW_OVERLAY_GROUP_RELATION_FOR_GROUP_ID}`,
  map_overlay_group_id: '5f88d3a361f76a2d3f000004',
  child_id: `${NEW_OVERLAY_GROUP_ID}`,
  child_type: 'mapOverlayGroup',
};

exports.up = async function (db) {
  await insertObject(db, 'mapOverlay', LINKED_MEASURE_OVERLAY);
  await insertObject(db, 'mapOverlay', MAIN_OVERLAY);
  await insertObject(db, 'map_overlay_group', NEW_OVERLAY_GROUP);
  await insertObject(db, 'map_overlay_group_relation', NEW_OVERLAY_GROUP_RELATION_FOR_OVERLAY);
  await insertObject(db, 'map_overlay_group_relation', NEW_OVERLAY_GROUP_RELATION_FOR_GROUP);
};

exports.down = async function (db) {
  await db.runSql(`
    DELETE FROM "mapOverlay" WHERE "id" = '${LINKED_MEASURE_OVERLAY_ID}';
  `);

  await db.runSql(`
    DELETE FROM "mapOverlay" WHERE "id" = '${MAIN_OVERLAY_ID}';
  `);

  await db.runSql(`
    DELETE FROM "map_overlay_group_relation" WHERE "child_id" = '${MAIN_OVERLAY_ID}';
  `);

  await db.runSql(`
    DELETE FROM "map_overlay_group_relation" WHERE "child_id" in
    (SELECT "id" from "map_overlay_group" WHERE "code" = 'STRIVE_Molecular_Data');
  `);

  await db.runSql(`
    DELETE FROM "map_overlay_group" WHERE "code" = 'STRIVE_Molecular_Data';
  `);
};

exports._meta = {
  version: 1,
};
