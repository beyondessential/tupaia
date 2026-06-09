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
    UPDATE user_country_permission
    SET
      country_id = (SELECT id FROM country WHERE code = 'DL'),
      permission_group_id = (SELECT id FROM permission_group WHERE name = 'Tupaia Admin Panel')
    WHERE
      country_id = (SELECT id FROM country WHERE code = 'NO');
  `);
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
