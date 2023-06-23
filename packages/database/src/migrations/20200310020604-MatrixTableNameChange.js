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
    update "dashboardReport" set "viewJson" = jsonb_set("viewJson", '{name}', '"JEE (Pacific Island Countries)"') where id = 'WHO_IHR_JEE_WPRO';
    update "dashboardReport" set "viewJson" = jsonb_set("viewJson", '{name}', '"SPAR (Pacific Island Countries)"') where id = 'WHO_IHR_SPAR_WPRO';
    update "dashboardReport" set "viewJson" = jsonb_set("viewJson", '{name}', '"Total number of Pacific States Parties submitting the IHR self-assessment annual report since 2010"') where id = 'WHO_SURVEY';
    update "dashboardReport" set "viewJson" = jsonb_set("viewJson", '{entityHeader}', '""') where id = 'WHO_SURVEY';
    update "dashboardReport" set "viewJson" = "viewJson" || '{"presentationOptions": {"hideAverage": true}}' where id = 'WHO_SURVEY';
    update "dashboardReport" set "viewJson" = "viewJson" || '{"entityHeader": "Pacific territories"}' where id = 'WHO_IHR_SPAR_NST';
    update "dashboardReport" set "viewJson" = jsonb_set("viewJson", '{name}', '"IHR self-assessments"') where id = 'WHO_IHR_SPAR_NST';
  `);
};

exports.down = function (db) {
  return db.runSql(`
    update "dashboardReport" set "viewJson" = jsonb_set("viewJson", '{name}', '"JEE (WPRO Countries)"') where id = 'WHO_IHR_JEE_WPRO';
    update "dashboardReport" set "viewJson" = jsonb_set("viewJson", '{name}', '"SPAR (WPRO Countries)"') where id = 'WHO_IHR_SPAR_WPRO';
    update "dashboardReport" set "viewJson" = jsonb_set("viewJson", '{name}', '"WHO SPAR Reporting Countries"') where id = 'WHO_SURVEY';
    update "dashboardReport" set "viewJson" = jsonb_set("viewJson", '{entityHeader}', '"Western Pacific Region"') where id = 'WHO_SURVEY';
    update "dashboardReport" SET "viewJson" = "viewJson" - 'presentationOptions' where id = 'WHO_SURVEY';  
    update "dashboardReport" set "viewJson" = "viewJson" - 'entityHeader' where id = 'WHO_IHR_SPAR_NST';
    update "dashboardReport" set "viewJson" = jsonb_set("viewJson", '{name}', '"SPAR (Non-sovereign territories)"') where id = 'WHO_IHR_SPAR_NST';
  `);
};

exports._meta = {
  version: 1,
};
