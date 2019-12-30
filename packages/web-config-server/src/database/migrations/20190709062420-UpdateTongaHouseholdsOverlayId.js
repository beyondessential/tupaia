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

exports.up = function(db) {
  return updateValues(db, 'mapOverlay', { id: 'TONGA_NUMBER_OF_HOUSEHOLDS' }, { id: '999' });
};

exports.down = function(db) {
  return updateValues(db, 'mapOverlay', { id: '999' }, { id: 'TONGA_NUMBER_OF_HOUSEHOLDS' });
};

exports._meta = {
  version: 1,
};
