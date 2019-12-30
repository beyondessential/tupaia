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

exports.up = function(db, callback) {
  const rejectOnError = (resolve, reject, error) => {
    if (error) {
      reject(error);
    } else {
      resolve();
    }
  };
  Promise.all([
    new Promise((resolve, reject) =>
      db.runSql(
        `INSERT INTO "dashboardGroup" ("organisationLevel", "userGroup", "organisationUnitCode", "name", "dashboardReports") VALUES ('Facility','Public', 'World', 'General', '{"21","22","18","8"}')`,
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.runSql(
        `INSERT INTO "dashboardGroup" ("organisationLevel", "userGroup", "organisationUnitCode", "name", "dashboardReports") VALUES ('Facility','Donor', 'World', 'General', '{"5","4","22","9","11","8"}')`,
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.runSql(
        `INSERT INTO "dashboardGroup" ("organisationLevel", "userGroup", "organisationUnitCode", "name", "dashboardReports") VALUES ('Facility','Donor', 'DL', 'General', '{"5","4","22","9","11","8"}')`,
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.runSql(
        `INSERT INTO "dashboardGroup" ("organisationLevel", "userGroup", "organisationUnitCode", "name", "dashboardReports") VALUES ('Facility','Admin','World', 'General', '{"2","6","9","11","16"}')`,
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.runSql(
        `INSERT INTO "dashboardGroup" ("organisationLevel", "userGroup", "organisationUnitCode", "name", "dashboardReports") VALUES ('Facility','Admin','DL', 'General', '{"2","6","9","11","16"}')`,
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.runSql(
        `INSERT INTO "dashboardGroup" ("organisationLevel", "userGroup", "organisationUnitCode", "name", "dashboardReports") VALUES ('Province','Public','World', 'General', '{"23","19","8","26"}')`,
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.runSql(
        `INSERT INTO "dashboardGroup" ("organisationLevel", "userGroup", "organisationUnitCode", "name", "dashboardReports") VALUES ('Province','Donor','World', 'General', '{"10","12","13","20","25"}')`,
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.runSql(
        `INSERT INTO "dashboardGroup" ("organisationLevel", "userGroup", "organisationUnitCode", "name", "dashboardReports") VALUES ('Province','Donor','DL', 'General', '{"10","12","13","20","25"}')`,
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.runSql(
        `INSERT INTO "dashboardGroup" ("organisationLevel", "userGroup", "organisationUnitCode", "name", "dashboardReports") VALUES ('Province','Admin','World', 'General', '{"3","7","10","12","17"}')`,
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.runSql(
        `INSERT INTO "dashboardGroup" ("organisationLevel", "userGroup", "organisationUnitCode", "name", "dashboardReports") VALUES ('Province','Admin','DL', 'General', '{"3","7","10","12","17"}')`,
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.runSql(
        `INSERT INTO "dashboardGroup" ("organisationLevel", "userGroup", "organisationUnitCode", "name", "dashboardReports") VALUES ('Country','Public','World', 'General', '{"23","19","8","26"}')`,
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.runSql(
        `INSERT INTO "dashboardGroup" ("organisationLevel", "userGroup", "organisationUnitCode", "name", "dashboardReports") VALUES ('Country','Donor','World', 'General', '{"10","12","13","20","25"}')`,
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.runSql(
        `INSERT INTO "dashboardGroup" ("organisationLevel", "userGroup", "organisationUnitCode", "name", "dashboardReports") VALUES ('Country','Donor','DL', 'General', '{"10","12","13","20","25"}')`,
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.runSql(
        `INSERT INTO "dashboardGroup" ("organisationLevel", "userGroup", "organisationUnitCode", "name", "dashboardReports") VALUES ('Country','Admin','World', 'General', '{"3","14","15","7","10","12","17"}')`,
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.runSql(
        `INSERT INTO "dashboardGroup" ("organisationLevel", "userGroup", "organisationUnitCode", "name", "dashboardReports") VALUES ('Country','Admin','DL', 'General', '{"3","14","15","7","10","12","17"}')`,
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.runSql(
        `INSERT INTO "dashboardGroup" ("organisationLevel", "userGroup", "organisationUnitCode", "name", "dashboardReports") VALUES ('Country','Admin','World', 'Clinical', '{"12","24","25","27"}')`,
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.runSql(
        `INSERT INTO "dashboardGroup" ("organisationLevel", "userGroup", "organisationUnitCode", "name", "dashboardReports") VALUES ('World','Public','World', 'General', '{"12","28","29","8","23"}')`,
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.runSql(
        `INSERT INTO "dashboardGroup" ("organisationLevel", "userGroup", "organisationUnitCode", "name", "dashboardReports") VALUES ('Facility','Donor','TO', 'Disaster Response', '{"8","31","9","30","35","34","32"}')`,
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.runSql(
        `INSERT INTO "dashboardGroup" ("organisationLevel", "userGroup", "organisationUnitCode", "name", "dashboardReports") VALUES ('Country','Admin','TO', 'PEHS', '{"36","38","37","40","52"}')`,
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.runSql(
        `INSERT INTO "dashboardGroup" ("organisationLevel", "userGroup", "organisationUnitCode", "name", "dashboardReports") VALUES ('Province','Admin','TO', 'PEHS', '{"36","38","37","40"}')`,
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.runSql(
        `INSERT INTO "dashboardGroup" ("organisationLevel", "userGroup", "organisationUnitCode", "name", "dashboardReports") VALUES ('Facility','Admin','TO', 'PEHS', '{"41","39","40","51"}')`,
        error => rejectOnError(resolve, reject, error),
      ),
    ),
  ]).then(() => callback());
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  version: 1,
};
