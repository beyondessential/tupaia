('use strict');

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

// Note: Laos Eoc District is a sub_district entity
const mapOverlay = {
  id: 'LA_EOC_Dengue_Cases_By_Week_District',
  name: 'Total weekly dengue cases by district',
  userGroup: 'Laos EOC User',
  dataElementCode: 'NCLE_Disease_Name',
  isDataRegional: false,
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
      aggregationEntityType: 'sub_district',
      aggregationOrder: 'BEFORE',
    },
  },
  measureBuilder: 'valueForOrgGroup',
  presentationOptions: {
    scaleType: 'performanceDesc',
    valueType: 'number',
    displayType: 'shaded-spectrum',
    measureLevel: 'SubDistrict',
    periodGranularity: 'one_week_at_a_time',
  },
  countryCodes: '{LA}',
  projectCodes: '{laos_eoc}',
};

const mapOverlayGroupCode = 'LAOS_EOC_Dengue';

const mapOverlayGroupRelation = groupId => ({
  id: generateId(),
  map_overlay_group_id: groupId,
  child_id: mapOverlay.id,
  child_type: 'mapOverlay',
  sort_order: 1,
});

const getMapOverlayGroupId = async function (db, code) {
  const results = await db.runSql(`SELECT id FROM map_overlay_group WHERE code = '${code}';`);

  if (results.rows.length > 0) {
    return results.rows[0].id;
  }

  throw new Error('MapOverlayGroup not found');
};

exports.up = async function (db) {
  await insertObject(db, 'mapOverlay', mapOverlay);
  const mapOverlayGroupId = await getMapOverlayGroupId(db, mapOverlayGroupCode);
  await insertObject(db, 'map_overlay_group_relation', mapOverlayGroupRelation(mapOverlayGroupId));
};

exports.down = function (db) {
  return db.runSql(`
    DELETE FROM map_overlay_group_relation WHERE child_id = '${mapOverlay.id}';
    DELETE FROM "mapOverlay" WHERE id = '${mapOverlay.id}';
  `);
};

exports._meta = {
  version: 1,
};
