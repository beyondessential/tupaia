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
  CREATE TYPE disaster_type AS ENUM('cyclone', 'eruption', 'earthquake', 'tsunami', 'flood');
  
  CREATE TYPE disaster_event_type AS ENUM('start', 'end', 'resolve');
  `);
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  version: 1,
};
