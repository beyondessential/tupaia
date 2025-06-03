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

// Note: Laos Eoc Province is a district entity
const mapOverlay = {
  id: 'LAOS_EOC_Total_Malaria_Cases_By_Week_Province',
  name: 'Total Weekly Malaria Cases by Province',
  userGroup: 'Laos EOC User',
  dataElementCode: 'Malaria_case',
  isDataRegional: false,
  measureBuilderConfig: {
    programCodes: ['Malaria_Case_Reporting'],
    entityAggregation: {
      dataSourceEntityType: 'district',
    },
  },
  measureBuilder: 'sumLatestPerOrgUnit',
  presentationOptions: {
    values: [
      {
        color: 'grey',
        value: null,
      },
    ],
    scaleBounds: {
      left: {
        max: 0,
      },
    },
    scaleType: 'performanceDesc',
    valueType: 'number',
    displayType: 'shaded-spectrum',
    measureLevel: 'District',
    periodGranularity: 'one_week_at_a_time',
  },
  countryCodes: '{LA}',
  projectCodes: '{laos_eoc}',
};

const mapOverlayGroupCode = 'LAOS_EOC_Malaria';

const mapOverlayGroupRelation = groupId => ({
  id: generateId(),
  map_overlay_group_id: groupId,
  child_id: mapOverlay.id,
  child_type: 'mapOverlay',
  sort_order: 0,
});

const getMapOverlayGroupId = async function (db, code) {
  const results = await db.runSql(`select "id" from "map_overlay_group" where "code" = '${code}';`);

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
    delete from "map_overlay_group_relation" where "child_id" = '${mapOverlay.id}';
    delete from "mapOverlay" where "id" = '${mapOverlay.id}';
  `);
};

exports._meta = {
  version: 1,
};
