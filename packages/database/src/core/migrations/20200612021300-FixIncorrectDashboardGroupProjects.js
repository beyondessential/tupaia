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

const dashboardGroups = {
  Explore_Project_IHR_Report: {
    oldProject: 'laos_schools',
    newProject: 'explore',
  },
  LA_Laos_Schools_School_Laos_Schools_Super_User: {
    oldProject: 'explore',
    newProject: 'laos_schools',
  },
};

const setProject = (db, dashboardGroupCode, projectCode) =>
  db.runSql(`
    UPDATE "dashboardGroup"
    SET "projectCodes" = '{"${projectCode}"}'
    WHERE "code" = '${dashboardGroupCode}';
  `);

exports.up = async function (db) {
  return Promise.all(
    Object.entries(dashboardGroups).map(async ([dashboardGroupCode, { newProject: projectCode }]) =>
      setProject(db, dashboardGroupCode, projectCode),
    ),
  );
};

exports.down = async function (db) {
  return Promise.all(
    Object.entries(dashboardGroups).map(async ([dashboardGroupCode, { oldProject: projectCode }]) =>
      setProject(db, dashboardGroupCode, projectCode),
    ),
  );
};

exports._meta = {
  version: 1,
};
