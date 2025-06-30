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
    update "entity_hierarchy"
    set "canonical_types" = '{country,district,sub_district,village,school}'
    where "name" = 'laos_schools';
  `);
};

exports.down = function (db) {
  return db.runSql(`
    update "entity_hierarchy"
    set "canonical_types" = '{}'
    where "name" = 'laos_schools';
  `);
};

exports._meta = {
  version: 1,
};
