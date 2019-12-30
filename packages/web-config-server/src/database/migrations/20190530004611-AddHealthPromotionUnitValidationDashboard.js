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
    INSERT INTO
      "dashboardGroup" (
        "organisationLevel",
        "userGroup",
        "organisationUnitCode",
        "dashboardReports",
        "name",
        "code"
      )
    VALUES
      (
        'Facility',
        'Tonga Health Promotion Unit',
        'TO',
        '{}',
        'Health Promotion Unit Validation',
        'TO_Health_Promotion_Unit_Validation'
      );

    INSERT INTO
      "dashboardGroup" (
        "organisationLevel",
        "userGroup",
        "organisationUnitCode",
        "dashboardReports",
        "name",
        "code"
      )
    VALUES
      (
        'Facility',
        'Tonga Health Promotion Unit',
        'DL',
        '{}',
        'Health Promotion Unit Validation',
        'DL_Health_Promotion_Unit_Validation'
      );
  `);
};

exports.down = function(db) {
  return db.runSql(`
    DELETE FROM
      "dashboardGroup"
    WHERE
      "code" IN ('TO_Health_Promotion_Unit_Validation', 'DL_Health_Promotion_Unit_Validation');
  `);
};

exports._meta = {
  version: 1,
};
