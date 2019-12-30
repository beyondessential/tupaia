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
    SET "dataBuilderConfig" = "dataBuilderConfig" || '{"valuesOfInterest": [0,1,2,3,4]}'
    WHERE "id" = 'SB_IHR_Bar'; -- International Health Regulations by Province

    UPDATE "dashboardReport"
    SET "dataBuilderConfig" = "dataBuilderConfig" || '{"valuesOfInterest": [1,2,3]}'
    WHERE "id" = '36' OR "id" = '38' OR "id" = '39'; -- PEHS Service Status
  `);
};

exports.down = function(db) {
  return db.runSql(`
    UPDATE "dashboardReport"
    SET "dataBuilderConfig" = "dataBuilderConfig" - 'valuesOfInterest'
    WHERE "id" = 'SB_IHR_Bar' OR "id" = '36' OR "id" = '38' OR "id" = '39';
  `);
};

exports._meta = {
  version: 1,
};
