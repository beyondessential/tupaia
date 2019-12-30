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
    SET "dataBuilderConfig" = "dataBuilderConfig" || '{"range": [0, 1]}'
    WHERE id = '13';

    UPDATE "dashboardReport"
    SET "dataBuilderConfig" = "dataBuilderConfig" || '{"range": [0, 1]}'
    WHERE id = '20';

    UPDATE "dashboardReport"
    SET "dataBuilderConfig" = "dataBuilderConfig" || '{"range": [0, 1]}'
    WHERE id = '29';

    UPDATE "dashboardReport"
    SET "dataBuilderConfig" = "dataBuilderConfig" || '{"range": [0, 1]}'
    WHERE id = '36';

    UPDATE "dashboardReport"
    SET "dataBuilderConfig" = "dataBuilderConfig" || '{"range": [0, 1]}'
    WHERE id = 'TO_RH_Descriptive_IMMS_Coverage';

    UPDATE "dashboardReport"
    SET "dataBuilderConfig" = "dataBuilderConfig" || '{"range": [0, 1]}'
    WHERE id = 'TO_RH_Descriptive_MCH05_01';
  `);
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  version: 1,
};
