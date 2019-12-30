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

exports.up = async function(db) {
  const dashBoardReport = await db.runSql(`
    SELECT * FROM "dashboardReport" WHERE "viewJson"->>'name' = '% Availability of Medicines from Facilities Surveyed Each Month';
  `);
  return db.runSql(`
    UPDATE "dashboardGroup" SET "dashboardReports" = array_remove("dashboardReports", '${dashBoardReport.rows[0].id}')
      WHERE "organisationLevel" = 'World' AND "name" = 'General';
  `);
};

exports.down = async function(db) {
  const dashBoardReport = await db.runSql(`
    SELECT * FROM "dashboardReport" WHERE "viewJson"->>'name' = '% Availability of Medicines from Facilities Surveyed Each Month';
  `);
  return db.runSql(`
    UPDATE "dashboardGroup" SET "dashboardReports" = "dashboardReports" || '${dashBoardReport.rows[0].id}'
      WHERE "organisationLevel" = 'World' AND "name" = 'General';
  `);
};

exports._meta = {
  "version": 1
};
