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
  name: 'Communicable Diseases',
  code: 'LA_EOC_Communicable_Diseases',
};

const MAP_OVERLAY = {
  id: 'LA_EOC_Dengue_Cases_By_Week',
  name: 'Total weekly dengue cases by district',
  dataElementCode: 'NCLE_Disease_Name',
  userGroup: 'Laos EOC User',
  measureBuilderConfig: {
    programCodes: ['NCLE_Communicable_Disease'],
    dataSourceType: 'custom',
    aggregationType: 'COUNT_PER_ORG_GROUP',
    dataElementCode: 'NCLE_Disease_Name',
    aggregationConfig: {
      condition: {
        value: ['7.1', '7.2', '7.3'],
        operator: 'in',
      },
    },
    entityAggregation: {
      dataSourceEntityType: 'facility',
      aggregationEntityType: 'district',
      aggregationOrder: 'BEFORE',
    },
  },
  isDataRegional: false,
  measureBuilder: 'valueForOrgGroup',
  presentationOptions: {
    scaleType: 'performanceDesc',
    valueType: 'number',
    displayType: 'shaded-spectrum',
    measureLevel: 'District',
    periodGranularity: 'one_week_at_a_time',
  },
  countryCodes: '{LA}',
  projectCodes: '{laos_eoc}',
};

const MAP_OVERLAY_GROUP_RELATION = {
  id: generateId(),
  map_overlay_group_id: MAP_OVERLAY_GROUP.id,
  child_id: MAP_OVERLAY.id,
  child_type: 'mapOverlay',
};

const getMapOverlayGroupId = async function (db, name) {
  const results = await db.runSql(`SELECT id FROM map_overlay_group WHERE name = '${name}';`);

  if (results.rows.length > 0) {
    return results.rows[0].id;
  }

  throw new Error('MapOverlayGroup not found');
};

exports.up = async function (db) {
  await insertObject(db, 'map_overlay_group', MAP_OVERLAY_GROUP);

  await insertObject(db, 'mapOverlay', MAP_OVERLAY);

  await insertObject(db, 'map_overlay_group_relation', MAP_OVERLAY_GROUP_RELATION);

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
  await db.runSql(
    `DELETE FROM "map_overlay_group_relation" WHERE child_id = '${MAP_OVERLAY_GROUP_RELATION.child_id}';`,
  );

  const mapOverlayGroupId = await getMapOverlayGroupId(db, MAP_OVERLAY_GROUP.name);

  await db.runSql(
    `DELETE FROM map_overlay_group_relation WHERE child_id = '${mapOverlayGroupId}';`,
  );

  await db.runSql(`DELETE FROM "map_overlay_group" WHERE code = '${MAP_OVERLAY_GROUP.code}';`);

  await db.runSql(`DELETE FROM "mapOverlay" WHERE id = '${MAP_OVERLAY.id}';`);

  return null;
};

exports._meta = {
  version: 1,
};
