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
    UPDATE "geographical_area"
    SET "name"='Yamoussoukro', "level_code"='district', "level_name"='District', "parent_id"=NULL, "code"='CI_Belier_Yamoussoukro'
    WHERE "id"='5ca2f0a7f013d605ac37287c';

    DELETE FROM "geographical_area" WHERE "id"='5ca2f0a7f013d605ac36e053';
`);
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  "version": 1
};
