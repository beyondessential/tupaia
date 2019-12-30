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
  const result = await db.runSql(`
    SELECT id FROM "mapOverlay"
      WHERE "dataElementCode" = 'DP_NEW008';
  `);
  const affectedStatusId = result.rows[0].id;

  return insertObject(db, 'mapOverlay', {
    name: 'Normal # inpatient beds',
    groupName: 'Disaster response',
    userGroup: 'Admin',
    displayType: 'radius',
    isDataRegional: true,
    hideFromMenu: false,
    hideFromPopup: false,
    hideFromLegend: false,
    linkedMeasures: `{${affectedStatusId}}`,
    dataElementCode: 'DP_NEW001',
  });
};

exports.down = function(db) {};

exports._meta = {
  version: 1,
};
