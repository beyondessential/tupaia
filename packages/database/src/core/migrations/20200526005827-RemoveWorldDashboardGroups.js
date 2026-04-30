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

exports.up = function (db) {
  return db.runSql(`
    DELETE FROM "dashboardGroup"
    WHERE "organisationUnitCode" = 'World';
  `);
};

exports.down = function (db) {
  return db.runSql(`
    INSERT INTO "dashboardGroup" ("id","organisationLevel","userGroup","organisationUnitCode","dashboardReports","name","code")
    VALUES
    (40,'World','Public','World','{active_disasters}','Disaster Response',NULL),
    (17,'World','Public','World','{28,29,8,23}','General',NULL),
    (83,'World','Public','World','{WHO_SURVEY,WHO_IHR_SPAR_WPRO,WHO_IHR_SPAR_NST,WHO_IHR_JEE_WPRO}','IHR Report',NULL);
  `);
};

exports._meta = {
  version: 1,
};
