'use strict';

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
  UPDATE survey
  SET code = 'DR_PRE'
  WHERE name = 'Disaster Preparation';
  
  UPDATE survey
  SET code = 'DR_POST_48hours'
  WHERE name = 'POST Disaster 24-48 hours';

  UPDATE survey
  SET code = 'DR_POST_2weeks'
  WHERE name = 'POST Disaster within 2 weeks';

  UPDATE survey
  SET code = 'DP_LEGACY'
  WHERE name = 'Disaster Prep & Response';

  UPDATE survey
  SET code = 'DR_LEGACY'
  WHERE name = 'Disaster Response';
`);
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  version: 1,
};
