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
    UPDATE "dashboardGroup"
    SET "dashboardReports" = array_remove("dashboardReports", 'SCRF_Case_By_Classifications')
    WHERE "code" IN (
      'PG_Strive_PNG_Facility',
      'PG_Strive_PNG_Country'
    );

    UPDATE "dashboardReport"
    SET "viewJson" = jsonb_set("viewJson", '{name}', '"Weekly % Febrile Cases by Age"')
    WHERE id = 'PG_Strive_PNG_Febrile_Cases_By_Age';

    UPDATE "dashboardReport"
    SET "viewJson" = jsonb_set("viewJson", '{name}', '"Weekly % Febrile Cases by Sex"')
    WHERE id = 'PG_Strive_PNG_Febrile_Cases_By_Sex';

    UPDATE "dashboardReport"
    SET "viewJson" = jsonb_set("viewJson", '{name}', '"Number of positive RDTs by result (since surveillance began)"')
    WHERE id = 'SCRF_RDT_Positive_Results';
  `);
};

exports.down = function(db) {
  return db.runSql(`
    UPDATE "dashboardGroup"
    SET "dashboardReports" = "dashboardReports" || '{"SCRF_Case_By_Classifications"}'
    WHERE "code" IN (
      'PG_Strive_PNG_Facility',
      'PG_Strive_PNG_Country'
    );

    UPDATE "dashboardReport"
    SET "viewJson" = jsonb_set("viewJson", '{name}', '"% Febrile Cases by Age"')
    WHERE id = 'PG_Strive_PNG_Febrile_Cases_By_Age';

    UPDATE "dashboardReport"
    SET "viewJson" = jsonb_set("viewJson", '{name}', '"% Febrile Cases by Sex"')
    WHERE id = 'PG_Strive_PNG_Febrile_Cases_By_Sex';

    UPDATE "dashboardReport"
    SET "viewJson" = jsonb_set("viewJson", '{name}', '"Number of positive RDTs by result"')
    WHERE id = 'SCRF_RDT_Positive_Results';
  `);
};

exports._meta = {
  version: 1,
};
