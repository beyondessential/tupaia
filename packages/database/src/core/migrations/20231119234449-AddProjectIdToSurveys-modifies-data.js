'use strict';

import projectSurveyMap from './migrationData/20231119234449-AddProjectIdToSurveys/projectSurveyMappings.json';

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
  const projects = await db.runSql(`
    SELECT id, code FROM project where code IN (${projectSurveyMap
      .map(item => `'${item.projectCode}'`)
      .join(',')});
  `);
  return projects.rows;
};

exports.up = async function (db) {
  // get the projects in the projectSurveyMap
  const projects = await getProjects(db);

  // get the surveys in the projectSurveyMap
  const existingSurveys = await db.runSql(`
  SELECT id, code, project_id FROM survey where code IN (${projectSurveyMap
    .map(item => `'${item.surveyCode}'`)
    .join(',')});
`);

  const dbUpdates = projectSurveyMap.reduce((acc, item) => {
    // get the project and survey for each item in the projectSurveyMap
    const project = projects.find(projectRow => projectRow.code === item.projectCode);
    const survey = existingSurveys.rows.find(surveyRow => surveyRow.code === item.surveyCode);

    // if either the project or survey is missing, skip this item
    if (!project || !survey) return acc;

    // return the update query for the survey
    return [...acc, `UPDATE survey SET project_id = '${project.id}' WHERE id = '${survey.id}';`];
  }, []);

  // do the updates
  await Promise.all(dbUpdates.map(item => db.runSql(item)));
};

exports.down = async function (db) {
  const projects = await getProjects(db);
  const existingSurveys = await db.runSql(`
  SELECT id, code, project_id FROM survey where code IN (${projectSurveyMap
    .map(item => `'${item.surveyCode}'`)
    .join(',')});
`);

  const dbChanges = projectSurveyMap.reduce((acc, item) => {
    // get the project and survey for each item in the projectSurveyMap
    const project = projects.find(projectRow => projectRow.code === item.projectCode);
    const survey = existingSurveys.rows.find(surveyRow => surveyRow.code === item.surveyCode);

    // if either the project or survey is missing, skip this item
    // also if the survey doesn't belong to the project, skip this item, as it means it has been updated some other way
    if (!project || !survey || survey.project_id !== project.id) return acc;

    // return the update query for the survey
    return [...acc, `UPDATE survey SET project_id = NULL WHERE id = '${survey.id}';`];
  }, []);

  await Promise.all(dbChanges.map(item => db.runSql(item)));
};

exports._meta = {
  version: 1,
};
