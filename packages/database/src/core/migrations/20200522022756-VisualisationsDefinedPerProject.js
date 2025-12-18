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

const LAOS_SCHOOLS_PROJECT_CODE = 'laos_schools';

const addProjectCodesColumn = async (db, tableName, defaultProjectCodes) =>
  db.runSql(`
    ALTER TABLE "${tableName}" ADD COLUMN "projectCodes" TEXT[] DEFAULT '{}';

    UPDATE "${tableName}"
    SET "projectCodes" = '{${defaultProjectCodes.map(c => `"${c}"`).join(',')}}';

    UPDATE "${tableName}"
    SET "projectCodes" = '{"${LAOS_SCHOOLS_PROJECT_CODE}"}'
    WHERE "userGroup" LIKE 'Laos Schools%';
`);

const removeProjectCodesColumn = async (db, tableName) =>
  db.runSql(`
    ALTER TABLE "${tableName}" DROP COLUMN "projectCodes";
  `);

exports.up = async function (db) {
  const projectRecords = (await db.runSql(`SELECT code FROM project;`)).rows;
  const projectCodesExceptLaos = projectRecords
    .map(r => r.code)
    .filter(c => c !== LAOS_SCHOOLS_PROJECT_CODE);
  await addProjectCodesColumn(db, 'mapOverlay', projectCodesExceptLaos);
  await addProjectCodesColumn(db, 'dashboardGroup', projectCodesExceptLaos);
};

exports.down = async function (db) {
  await removeProjectCodesColumn(db, 'mapOverlay');
  await removeProjectCodesColumn(db, 'dashboardGroup');
};

exports._meta = {
  version: 1,
};
