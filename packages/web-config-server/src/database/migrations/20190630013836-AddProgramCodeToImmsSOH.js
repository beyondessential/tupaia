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

const PROGRAM_CODE = 'FRIDGE_DAILY';
const REPORT_ID = 'Imms_FridgeVaccineCount';

exports.up = function(db) {
  return db.runSql(`
    UPDATE "dashboardReport"
      SET "dataBuilderConfig" = "dataBuilderConfig" || '{"programCode":"${PROGRAM_CODE}"}'
      WHERE "id" = '${REPORT_ID}';
  `);
};

exports.down = function(db) {
  return db.runSql(`
    UPDATE "dashboardReport"
      SET "dataBuilderConfig" = "dataBuilderConfig" - 'programCode'
      WHERE "id" = '${REPORT_ID}';
  `);
};

exports._meta = {
  version: 1,
};
