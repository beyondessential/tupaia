'use strict';

import { insertObject } from '../migrationUtilities';

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

exports.up = async function(db) {
  await insertObject(db, 'mapOverlay', {
    name: 'Facility type',
    groupName: 'Disaster response',
    userGroup: 'Public',
    displayType: 'icon',
    isDataRegional: true,
    hideFromMenu: true,
    hideFromPopup: false,
    hideFromLegend: false,
    sortOrder: -1,
    values: [
      { value: 1, name: 'Hospital', icon: 'h' },
      { value: 2, name: 'Community health centre', icon: 'pentagon' },
      { value: 3, name: 'Clinic', icon: 'circle' },
      { value: 4, name: 'Aid post', icon: 'triangle' },
      { value: 'other', name: 'Other', icon: 'ring' },
    ],
    dataElementCode: 'facilityTypeCode',
  });

  const result = await db.runSql(`
    SELECT id FROM "mapOverlay"
      WHERE "dataElementCode" = 'facilityTypeCode'
      AND "hideFromMenu" = true
      AND "displayType" = 'icon';
  `);
  const id = result.rows[0].id;

  return db.runSql(`
    UPDATE "mapOverlay"
    SET "linkedMeasures" = '{${id}}'
    WHERE "name" = 'Disaster affected facilities';
  `);
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  version: 1,
};
