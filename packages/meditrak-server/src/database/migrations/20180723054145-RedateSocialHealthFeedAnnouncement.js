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
    UPDATE feed_item
    SET creation_date='2018-07-23'
    WHERE id='5b14bca1820f65340b49a9c3'
  `);
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  version: 1,
};
