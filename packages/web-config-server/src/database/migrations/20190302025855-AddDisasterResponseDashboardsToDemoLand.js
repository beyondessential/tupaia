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
    INSERT INTO "dashboardGroup" (
      "organisationLevel",
      "userGroup",
      "organisationUnitCode",
      "dashboardReports",
      "name",
      "code",
      "viewMode")
    SELECT
      "organisationLevel",
      'Public',
      'DL',
      "dashboardReports",
      "name",
      "code" || '_DL' as code,
      "viewMode"
    FROM "dashboardGroup"
    WHERE "viewMode" = 'disaster' AND "organisationLevel" = 'Country';

    INSERT INTO "dashboardGroup" (
      "organisationLevel",
      "userGroup",
      "organisationUnitCode",
      "dashboardReports",
      "name",
      "code",
      "viewMode")
    SELECT
      "organisationLevel",
      'Public',
      'DL',
      "dashboardReports",
      "name",
      "code" || '_DL' as code,
      "viewMode"
    FROM "dashboardGroup"
    WHERE "viewMode" = 'disaster' AND "organisationLevel" = 'Province';

    INSERT INTO "dashboardGroup" (
      "organisationLevel",
      "userGroup",
      "organisationUnitCode",
      "dashboardReports",
      "name",
      "code",
      "viewMode")
    SELECT
      "organisationLevel",
      'Public',
      'DL',
      "dashboardReports",
      "name",
      "code" || '_DL' as code,
      "viewMode"
    FROM "dashboardGroup"
    WHERE "viewMode" = 'disaster' AND "organisationLevel" = 'Facility';
  `);
};

exports.down = function(db) {
  return db.runSql(`
    DELETE FROM "dashboardGroup"
    WHERE "viewMode" = 'disaster' AND "organisationUnitCode" = 'DL';
  `);
};

exports._meta = {
  version: 1,
};
