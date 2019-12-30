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

const TEMP_REPORT_ID = 'Imms_FridgeSoH';
const NEW_REPORT_ID = 'Imms_FridgeVaccineCount';

exports.up = async function(db) {
  // Delete the temporary one that was developed early on
  await db.runSql(`
    DELETE FROM "dashboardReport"
      WHERE "id" = '${TEMP_REPORT_ID}';
  `);

  // Add the new one into the facility level dashboard group
  await db.runSql(`
    UPDATE
      "dashboardGroup"
    SET
      "dashboardReports" = "dashboardReports" || '{ ${NEW_REPORT_ID} }'
    WHERE
      "code" = 'VU_Imms_Facility';
  `);
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  version: 1,
};
