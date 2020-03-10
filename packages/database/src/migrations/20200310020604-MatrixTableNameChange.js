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
    update "dashboardReport" set "viewJson" = jsonb_set("viewJson", '{name}', '"JEE (Pacific Island Countries)"') where id = 'WHO_IHR_JEE_WPRO';
    update "dashboardReport" set "viewJson" = jsonb_set("viewJson", '{name}', '"SPAR (Pacific Island Countries)"') where id = 'WHO_IHR_SPAR_WPRO';
  `);
};

exports.down = function(db) {
  return db.runSql(`
  update "dashboardReport" set "viewJson" = jsonb_set("viewJson", '{name}', '"JEE (WPRO Countries)"') where id = 'WHO_IHR_JEE_WPRO';
  update "dashboardReport" set "viewJson" = jsonb_set("viewJson", '{name}', '"SPAR (WPRO Countries)"') where id = 'WHO_IHR_SPAR_WPRO';
`);
};

exports._meta = {
  version: 1,
};
