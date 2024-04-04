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

const getProjects = async db => {
  const { rows } = await db.runSql(`SELECT * FROM project`);
  return rows;
};

const updateProject = async (db, project) => {
  const { id, config } = project;
  const newExcludedTypes = ['case', 'case_contact'];
  const currentFrontendExcluded = config.frontendExcluded || [];

  const typesToAddToExcluded = newExcludedTypes.filter(
    type => !currentFrontendExcluded.some(e => e.types.includes(type)),
  );

  if (typesToAddToExcluded.length === 0) return;
  // excluded types allows for an array, so we will add to it in case it already exists with exceptions
  const newConfig = {
    ...config,
    frontendExcluded: [...currentFrontendExcluded, { types: typesToAddToExcluded }],
  };
  await db.runSql(`UPDATE project SET config = '${JSON.stringify(newConfig)}' WHERE id = '${id}'`);
};

exports.up = async function (db) {
  const projects = await getProjects(db);
  await Promise.all(projects.map(project => updateProject(db, project)));
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
