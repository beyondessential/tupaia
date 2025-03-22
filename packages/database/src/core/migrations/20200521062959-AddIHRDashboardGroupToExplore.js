'use strict';

var dbm;
var type;
var seed;

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = async function (db) {
  return db.runSql(`
      INSERT INTO "dashboardGroup"("organisationLevel","userGroup","organisationUnitCode","dashboardReports","name","code")
      VALUES
      (E'Project',E'Public',E'explore',E'{WHO_SURVEY,WHO_IHR_SPAR_WPRO,WHO_IHR_SPAR_NST,WHO_IHR_JEE_WPRO}',E'IHR Report',E'Explore_Project_IHR_Report');
`);
};

exports.down = function (db) {
  return db.runSql(`
    DELETE FROM "dashboardGroup" where "code" = 'Explore_Project_IHR_Report';
  `);
};

exports._meta = {
  version: 1,
};
