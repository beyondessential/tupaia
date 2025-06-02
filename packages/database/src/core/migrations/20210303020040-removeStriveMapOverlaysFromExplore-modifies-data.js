'use strict';

import { arrayToDbString } from '../utilities';

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

const mapOverlayIds = [
  'PG_STRIVE_K13_C580Y_Positive_Count',
  'PG_STRIVE_K13_C580Y_Positive',
  'PG_STRIVE_QMAL05_Positive',
  'PG_STRIVE_PF05_Positive',
  'PG_STRIVE_PV05_Positive',
  'PG_STRIVE_PM05_Positive',
  'PG_STRIVE_PO05_Positive',
];

exports.up = function (db) {
  return db.runSql(`
    update "mapOverlay" 
    set "projectCodes" = array_remove("projectCodes",'explore')
    where id in (${arrayToDbString(mapOverlayIds)});
  `);
};

exports.down = function (db) {
  return db.runSql(`
    update "mapOverlay" 
    set "projectCodes" = "projectCodes" || '{explore}'
    where id in (${arrayToDbString(mapOverlayIds)});
  `);
};

exports._meta = {
  version: 1,
};
