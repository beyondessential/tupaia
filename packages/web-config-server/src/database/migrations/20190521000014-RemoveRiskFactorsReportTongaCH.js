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
    UPDATE
      "dashboardGroup"
    SET
      "dashboardReports" = array_remove("dashboardReports", 'TO_CH_Descriptive_RiskFactors')
    WHERE
      "code" IN (
        'Tonga_Community_Health_Country',
        'Tonga_Community_Health_District',
        'Tonga_Community_Health_Facility'
      );

    DELETE FROM "dashboardReport"
    WHERE id = 'TO_CH_Descriptive_RiskFactors';
  `);
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  version: 1,
};
