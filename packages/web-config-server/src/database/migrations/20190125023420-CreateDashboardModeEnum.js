'use strict';

import { rejectOnError } from '../migrationUtilities';

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
  return db.runSql(`
    CREATE TYPE view_mode AS ENUM('explore', 'disaster');
  `);
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  version: 1,
};
