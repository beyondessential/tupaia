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
    UPDATE clinic SET "category_code" = "type"
    WHERE "category_code" IS NULL;

    UPDATE "clinic" SET "type_name" = 'Hospital'
    WHERE "category_code" = '1' AND "type_name" IS NULL;

    UPDATE "clinic" SET "type_name" = 'Clinic'
    WHERE "category_code" = '2' AND "type_name" IS NULL;
  `);
};

exports.down = function(db) {
  return db.runSql(`
    UPDATE clinic SET "category_code" = NULL, "type_name" = NULL
    WHERE "country_id" IN (SELECT "id" FROM "country" WHERE "code" = 'VE');
  `);
};

exports._meta = {
  version: 1,
};
