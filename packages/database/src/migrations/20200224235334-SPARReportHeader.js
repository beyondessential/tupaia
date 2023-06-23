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
    update "dashboardReport"set "viewJson" = "viewJson" || '{"entityHeader": "2018"}' where id = 'WHO_IHR_SPAR_WPRO';
    update "dashboardReport" set "viewJson" = "viewJson" || '{"entityHeader": "WPRO, 2018"}' where id = 'WHO_IHR_SPAR_NST';
`);
};

exports.down = function (db) {
  return db.runSql(`
    UPDATE "dashboardReport" SET "viewJson" = "viewJson" - 'entityHeader' where id in ('WHO_IHR_SPAR_NST', 'WHO_IHR_SPAR_WPRO');  
  `);
};

exports._meta = {
  version: 1,
};
