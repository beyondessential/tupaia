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

const mapOverlay = {
  id: 'PNG_STRIVE_Resistance',
  name: 'Resistance',
  userGroup: 'STRIVE User',
  dataElementCode: 'STRVEC_AE-IR11',
  measureBuilderConfig: {
    entityAggregation: {
      dataSourceEntityType: 'facility',
    },
  },
  measureBuilder: 'valueForOrgGroup',
  presentationOptions: {
    values: [
      {
        name: 'No data',
        color: 'grey',
        value: null,
      },
      {
        name: 'Confirmed resistance',
        color: 'red',
        value: 'Confirmed resistance',
      },
      {
        name: 'Possible resistance',
        color: 'yellow',
        value: 'Possible resistance',
      },
      {
        name: 'Susceptible',
        color: 'green',
        value: 'Susceptible',
      },
    ],
    displayType: 'color',
    measureLevel: 'Facility',
  },
  countryCodes: '{PG}',
  projectCodes: '{strive}',
};

const mapOverlayGroupCode = 'STRIVE_Vector_Data';

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
