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

const mapOverlays = require('./migrationData/20200524212939-LimitVisualisationsPerProject/MapOverlays.json');
const dashboardGroups = require('./migrationData/20200524212939-LimitVisualisationsPerProject/DashboardGroups.json');

const setProjectsForTable = async (db, tableName, entries, idIsString = false) =>
  Promise.all(
    entries.map(async ([id, projectCodes]) =>
      db.runSql(`
  UPDATE "${tableName}"
  SET "projectCodes" = '{${projectCodes.map(p => `"${p}"`).join(',')}}'
  WHERE "id" = ${idIsString ? `'${id}'` : id};
`),
    ),
  );

exports.up = async function (db) {
  await setProjectsForTable(db, 'mapOverlay', mapOverlays, true);
  await setProjectsForTable(db, 'dashboardGroup', dashboardGroups, false);
};

const LAOS_SCHOOLS_PROJECT_CODE = 'laos_schools';

const resetVizToPriorProjectCodes = async (db, tableName, defaultProjectCodes) =>
  db.runSql(`
    UPDATE "${tableName}"
    SET "projectCodes" = '{${defaultProjectCodes.map(c => `"${c}"`).join(',')}}';

    UPDATE "${tableName}"
    SET "projectCodes" = '{"${LAOS_SCHOOLS_PROJECT_CODE}"}'
    WHERE "userGroup" LIKE 'Laos Schools%';
`);

exports.down = async function (db) {
  const projectRecords = (await db.runSql(`SELECT code FROM project;`)).rows;
  const projectCodesExceptLaos = projectRecords
    .map(r => r.code)
    .filter(c => c !== LAOS_SCHOOLS_PROJECT_CODE);
  await resetVizToPriorProjectCodes(db, 'mapOverlay', projectCodesExceptLaos);
  await resetVizToPriorProjectCodes(db, 'dashboardGroup', projectCodesExceptLaos);
};

exports._meta = {
  version: 1,
};
