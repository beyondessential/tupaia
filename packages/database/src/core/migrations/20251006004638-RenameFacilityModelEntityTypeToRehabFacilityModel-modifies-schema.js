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
  return db.runSql(
    "ALTER TYPE public.entity_type RENAME VALUE 'facility_model' TO 'rehab_facility_model';",
  );
};

exports.down = function (db) {
  return db.runSql(
    "ALTER TYPE public.entity_type RENAME VALUE 'rehab_facility_model' TO 'facility_model';",
  );
};

exports._meta = {
  version: 1,
};
