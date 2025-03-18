'use strict';

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

exports.up = function (db) {
  return db.runSql(`
    UPDATE entity SET metadata = jsonb_set(metadata, '{ms1}', '{"distributionId": "2516"}')
      WHERE code = 'KI_BonE02';
  `);
};

exports.down = function (db) {
  return db.runSql(`
    UPDATE entity SET metadata = metadata::jsonb - 'ms1'
      WHERE code = 'KI_BonE02';
  `);
};

exports._meta = {
  version: 1,
};
