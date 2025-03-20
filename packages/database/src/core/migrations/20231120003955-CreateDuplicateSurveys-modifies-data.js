/* eslint-disable camelcase */

'use strict';

import surveys from './migrationData/20231120003955-CreateDuplicateSurveys/surveys.json';
import { generateId, insertObject } from '../utilities';

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

// get id of project with code newProjectCode
const getProjectId = async (db, projectCode) => {
  const projectId = await db.runSql(`SELECT id FROM project WHERE code = '${projectCode}'`);
  return projectId.rows[0].id;
};

// get new survey code by appending project initials to old survey code
const getNewSurveyCode = (oldSurveyCode, newProjectCode) => {
  return `${oldSurveyCode}_DT`;
};

// get survey with code surveyCode
const getExistingSurvey = async (db, surveyCode) => {
  const existingSurvey = await db.runSql(`
  SELECT * FROM survey WHERE code = '${surveyCode}';
  `);

  return existingSurvey.rows[0];
};

// get the survey screens by surveyId
const getSurveyScreens = async (db, surveyId) => {
  const surveyScreens = await db.runSql(`
  SELECT * FROM survey_screen WHERE survey_id = '${surveyId}';
  `);

  return surveyScreens.rows;
};

// get the survey screen components for the survey screens
const getSurveyScreenComponents = async (db, surveyScreens) => {
  const surveyScreenComponents = await db.runSql(`
  SELECT * FROM survey_screen_component WHERE screen_id IN (${surveyScreens
    .map(screen => `'${screen.id}'`)
    .join(',')});
  `);

  return surveyScreenComponents.rows;
};

// get the data group for the survey
const getDataGroup = async (db, dataGroupId) => {
  const dataGroup = await db.runSql(`
  SELECT * FROM data_group WHERE id = '${dataGroupId}';
  `);

  if (!dataGroup.rows.length) {
    throw new Error(`No data group found with id ${dataGroupId}`);
  }
  return dataGroup.rows[0];
};

// these are the only country names that will be in the provided surveys' names
const countryNames = ['Tonga', 'Samoa'];

const getNewSurveyName = surveyName => {
  // Remove country name from survey name, and add Demo Land to make it unique
  const countryNameRegex = new RegExp(countryNames.join('|'), 'gi');
  return `${surveyName.replace(countryNameRegex, '')} - Demo Land`;
};

const createNewSurvey = async (db, survey, countryId, permissionGroupId) => {
  const { oldSurveyCode, newProjectCode } = survey;
  const newProjectId = await getProjectId(db, newProjectCode);
  const newSurveyCode = getNewSurveyCode(oldSurveyCode, newProjectCode);

  const existingSurvey = await getExistingSurvey(db, oldSurveyCode);

  // if that survey doesn't exist, don't break, just return early
  if (!existingSurvey) return;

  const {
    id,
    name,
    can_repeat,
    survey_group_id,
    integration_metadata,
    requires_approval,
    data_group_id,
  } = existingSurvey;

  const existingSurveyScreens = await getSurveyScreens(db, id);

  const existingSurveyScreenComponents = await getSurveyScreenComponents(db, existingSurveyScreens);

  const newSurveyId = generateId();

  // create the data group
  const dataGroup = await getDataGroup(db, data_group_id);
  const newSurveyDataGroupId = generateId();
  await insertObject(db, 'data_group', {
    ...dataGroup,
    id: newSurveyDataGroupId,
    code: newSurveyCode,
  });

  // create the survey
  await insertObject(db, 'survey', {
    id: newSurveyId,
    code: newSurveyCode,
    country_ids: `{${countryId}}`,
    project_id: newProjectId,
    permission_group_id: permissionGroupId,
    name: getNewSurveyName(name),
    can_repeat,
    survey_group_id,
    integration_metadata,
    requires_approval,
    data_group_id: newSurveyDataGroupId,
  });

  // map the old survey screen ids to new survey screen ids
  const surveyScreenIdMap = existingSurveyScreens.reduce(
    (acc, screen) => ({ ...acc, [screen.id]: generateId() }),
    {},
  );

  // create the new survey screens
  await Promise.all(
    existingSurveyScreens.map(screen =>
      insertObject(db, 'survey_screen', {
        screen_number: screen.screen_number,
        id: surveyScreenIdMap[screen.id],
        survey_id: newSurveyId,
      }),
    ),
  );

  // create the new survey screen components
  const newSurveyScreenComponents = existingSurveyScreenComponents.map(component => {
    const {
      question_id,
      component_number,
      is_follow_up,
      visibility_criteria,
      config,
      validation_criteria,
    } = component;
    const newSurveyScreenId = surveyScreenIdMap[component.screen_id];
    return {
      question_id,
      component_number,
      is_follow_up,
      id: generateId(),
      screen_id: newSurveyScreenId,
      visibility_criteria,
      config,
      validation_criteria,
    };
  });

  await Promise.all(
    newSurveyScreenComponents.map(component =>
      insertObject(db, 'survey_screen_component', component),
    ),
  );
};

exports.up = async function (db) {
  // all the duplicated surveys will be in the same country, Demo Land
  const country = await db.runSql(`SELECT id FROM country WHERE name = 'Demo Land'`);

  const permissionGroup = await db.runSql(`SELECT id FROM permission_group WHERE name = 'Public'`);
  return Promise.all(
    surveys.map(survey =>
      createNewSurvey(db, survey, country.rows[0].id, permissionGroup.rows[0].id),
    ),
  );
};

const removeSurvey = async (db, survey) => {
  const { oldSurveyCode, newProjectCode } = survey;

  const newSurveyCode = getNewSurveyCode(oldSurveyCode, newProjectCode);

  const existingSurvey = await getExistingSurvey(db, newSurveyCode);

  if (!existingSurvey) return;

  const existingSurveyScreens = await getSurveyScreens(db, existingSurvey.id);

  await db.runSql(`
    DELETE FROM data_group WHERE code = '${newSurveyCode}';
  `);

  if (existingSurveyScreens.length) {
    await db.runSql(`
    DELETE FROM survey_screen_component WHERE screen_id IN (${existingSurveyScreens
      .map(screen => `'${screen.id}'`)
      .join(',')});
  `);
  }

  await db.runSql(`
    DELETE FROM survey_response WHERE survey_id = '${existingSurvey.id}';
  `);

  await db.runSql(`
    DELETE FROM survey_screen WHERE survey_id = '${existingSurvey.id}';
  `);

  await db.runSql(`
    DELETE FROM survey WHERE id = '${existingSurvey.id}';
  `);
};

exports.down = function (db) {
  return Promise.all(surveys.map(survey => removeSurvey(db, survey)));
};

exports._meta = {
  version: 1,
};
