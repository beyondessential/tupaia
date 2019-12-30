'use strict';

import { updateValues } from '../migrationUtilities';

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
  return updateValues(
    db,
    'mapOverlay',
    { name: 'Stock on Hand x Breaches (30 days)' },
    { id: 'BREACH_LAST_30_DAYS' },
  );
};

exports.down = async function(db) {
  return updateValues(
    db,
    'mapOverlay',
    { name: 'Breaches x Stock on Hand' },
    { id: 'BREACH_LAST_30_DAYS' },
  );
};

exports._meta = {
  version: 1,
};
