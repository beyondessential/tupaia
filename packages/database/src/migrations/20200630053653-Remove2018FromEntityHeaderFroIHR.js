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
        UPDATE "dashboardReport"
        SET "viewJson" = "viewJson" || '{"entityHeader": ""}'
        WHERE id in ('WHO_IHR_JEE_WPRO', 'WHO_IHR_SPAR_WPRO');
      `);
};

exports.down = function(db) {
  return db.runSql(`
        UPDATE "dashboardReport"
        SET "viewJson" = "viewJson" || '{"entityHeader": "2018"}'
        WHERE id in ('WHO_IHR_JEE_WPRO', 'WHO_IHR_SPAR_WPRO');
      `);
};

exports._meta = {
  version: 1,
};
