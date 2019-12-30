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
      SET "dataBuilderConfig" = (regexp_replace("dataBuilderConfig"::text, 'Tonga_', '', 'g'))::json
      WHERE id LIKE 'TO_CD_Validation%';
  `);
};

exports.down = function(db) {
  return db.runSql(`
    UPDATE "dashboardReport"
      SET "dataBuilderConfig" = (regexp_replace("dataBuilderConfig"::text, 'CD', 'Tonga_CD', 'g'))::json
      WHERE id LIKE 'TO_CD_Validation%';
  `);
};

exports._meta = {
  version: 1,
};
