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
    set "canonical_types" = '{country,district}' 
    where "name" = 'supplychain_fiji';

    update "entity_hierarchy" 
    set "canonical_types" = '{country,district,facility}' 
    where "name" = 'unfpa';
  `);
};

exports.down = function (db) {
  return db.runSql(`
    update "entity_hierarchy" 
    set "canonical_types" = '{country,district,village,facility}' 
    where "name" = 'supplychain_fiji';

    update "entity_hierarchy" 
    set "canonical_types" = '{}' 
    where "name" = 'unfpa';
  `);
};

exports._meta = {
  version: 1,
};
