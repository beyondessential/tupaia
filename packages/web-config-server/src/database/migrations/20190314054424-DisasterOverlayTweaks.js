'use strict';

import { insertMultipleObjects } from '../migrationUtilities';

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

const base = {
  groupName: 'Disaster response',
  userGroup: 'Admin',
  measureBuilder: 'valueForOrgGroup',
  measureBuilderConfig: { level: 'Facility' },
};

const radiusValues = [{ color: 'blue', value: 'other' }, { color: 'grey', value: null }];

const newOverlays = [
  {
    name: 'Water purificiation tablets',
    displayType: 'radius',
    values: radiusValues,
    dataElementCode: 'DP70',
    sortOrder: 1,
  },
  {
    name: 'Mosquito nets',
    displayType: 'radius',
    values: radiusValues,
    dataElementCode: 'DP69',
    sortOrder: 1,
  },
  {
    name: 'Electricity affected',
    displayType: 'icon',
    dataElementCode: 'DP74H',
    sortOrder: 2,
  },
  {
    name: 'Water supply affected',
    displayType: 'icon',
    dataElementCode: 'DP74J',
    sortOrder: 2,
  },
].map(x => ({ ...base, ...x }));

exports.up = async function(db) {
  await db.runSql(`
    UPDATE "mapOverlay"
      SET
        "sortOrder" = -0.75
      WHERE "dataElementCode" = 'DP_NEW001';
  `);

  // Rename # inpatient beds to Current # inpatient beds
  // Reorder disaster response map overlays so that
  // Current # inpatient beds is immediately after Normal # inpatient beds
  await db.runSql(`
    UPDATE "mapOverlay"
      SET
        "name" = 'Current # of usable beds',
        "sortOrder" = -0.5
      WHERE "dataElementCode" = 'DP9';
  `);

  // Create and add map overlay for Mosquito nets to disaster response group
  await insertMultipleObjects(db, 'mapOverlay', newOverlays.filter(o => o.displayType === 'icon'));

  // Get ID of disaster affected status
  const result = await db.runSql(`
    SELECT id FROM "mapOverlay"
      WHERE "dataElementCode" = 'DP_NEW008';
  `);
  const id = result.rows[0].id;

  // Add map overlay for Water purification tablets to disaster response group
  // Create and add map overlay for Electricity affected
  // Create and add map overlay for Water supply affected
  await insertMultipleObjects(
    db,
    'mapOverlay',
    newOverlays
      .filter(o => o.displayType === 'radius')
      .map(o => ({ ...o, linkedMeasures: `{${id}}` })),
  );

  return;
};

exports.down = function(db) {
  // don't worry about reverting the inpatient beds name change

  const deletes = newOverlays.map(
    o => `
    DELETE FROM "mapOverlay"
      WHERE "dataElementCode" = '${o.dataElementCode}'
      AND "groupName" = '${o.groupName}';
  `,
  );

  return db.runSql(deletes.join('\n'));
};

exports._meta = {
  version: 1,
};
