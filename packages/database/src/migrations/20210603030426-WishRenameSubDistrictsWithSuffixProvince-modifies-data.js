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
    update "entity" 
    set "name" = "name" || ' Province' 
    where country_code = 'FJ' and "type" = 'sub_district' and code like 'FJ_PROV%';
  `);
};

exports.down = function(db) {
  return db.runSql(`
    update "entity" 
    set "name" = SUBSTRING ( name, 1, length(name)-9 ) 
    where country_code = 'FJ' and "type" = 'sub_district' and code like 'FJ_PROV%';
  `);
};

exports._meta = {
  "version": 1
};
