'use strict';

import { arrayToDbString } from '../utilities';

var dbm;
var type;
var seed;

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */

const OVERLAY_IDS = ['TONGA_NUMBER_OF_HOUSEHOLDS'];

exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function (db) {
  return db.runSql(`
    UPDATE 
      "mapOverlay"
    SET 
      "presentationOptions" = jsonb_set(
        "presentationOptions",
        '{scaleType}',
        '"neutral"'
      )
    WHERE 
      id in (${arrayToDbString(OVERLAY_IDS)});
  `);
};

exports.down = function (db) {
  return db.runSql(`
    UPDATE 
      "mapOverlay"
    SET 
      "presentationOptions" = jsonb_set(
        "presentationOptions",
        '{scaleType}',
        ' "population"'
      )
    WHERE 
      id in (${arrayToDbString(OVERLAY_IDS)});
  `);
};

exports._meta = {
  version: 1,
};
