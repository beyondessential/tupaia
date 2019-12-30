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
      WHERE "dataElementCode" = 'facilityTypeCode'
      AND "hideFromMenu" = true;
  `);
  const id = result.rows[0].id;

  return db.runSql(`
    UPDATE "mapOverlay"
    SET
      "displayType" = 'color',
      "linkedMeasures" = '{${id}}',
      "values" = '[
        {"name": "Not affected", "color": "green", "value": 0},
        {"name": "Partially affected", "color": "yellow", "value": 1},
        {"name": "Completely affected", "color": "red", "value": 2},
        {"name": "Not applicable", "color": "blue", "value": 3}
      ]',
      "dataElementCode" = 'DP_NEW008'
    WHERE "dataElementCode" = 'facilityTypeCode'
    AND "hideFromMenu" = false;
  `);
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  version: 1,
};
