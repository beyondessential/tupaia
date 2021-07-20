'use strict';

import { arrayToDbString, insertObject, generateId } from '../utilities';

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
const selectSurveysByCode = async (db, surveyCodes) => {
  const { rows: surveys } = await db.runSql(`
    SELECT * from survey s WHERE s.code in (${arrayToDbString(surveyCodes)});
  `);
  return surveys;
};

const selectQuestionsBySurveyCode = async (db, surveyCode) => {
  const { rows: questions } = await db.runSql(`
    SELECT q.*  FROM question q
    JOIN survey_screen_component scc ON scc.question_id = q.id 
    JOIN survey_screen sc ON sc.id = scc.screen_id 
    JOIN survey s ON s.id = sc.survey_id 
    WHERE s.code = '${surveyCode}'  
  `);
  return questions;
};

/**
 * @return {Promise<string>} The id of the found/created record
 */
const findOrCreateDataSource = async (db, dataSourceData) => {
  const dataSourceResults = await db.runSql(
    `SELECT * FROM data_source WHERE code = '${dataSourceData.code}' AND type = '${dataSourceData.type}'`,
  );
  const [dataSource] = dataSourceResults.rows;
  if (dataSource) {
    if (dataSource.service_type === 'tupaia') {
      return dataSource.id;
    }

    await db.runSql(
      `UPDATE data_source SET "service_type" = 'tupaia', config = '{}' WHERE id = '${dataSource.id}'`,
    );
    return dataSource.id;
  }

  const dataSourceId = generateId();
  await insertObject(db, 'data_source', {
    ...dataSourceData,
    id: dataSourceId,
    service_type: 'tupaia',
  });

  return dataSourceId;
};

/**
 * @return {Promise<string>} The id of the found/created record
 */
const findAndUpdateDataSource = async (db, surveyCode) => {
  const dataSourceResults = await db.runSql(
    `SELECT * FROM data_source WHERE code = '${surveyCode}'`,
  );
  const [dataSource] = dataSourceResults.rows;
  if (dataSource.service_type === 'tupaia') {
    return dataSource.id;
  }

  await db.runSql(
    `UPDATE data_source SET "service_type" = 'tupaia', config = '{}' WHERE id = '${dataSource.id}'`,
  );

  return dataSource.id;
};

const insertDataSources = async (db, questions, surveyCode) => {
  const dataGroupId = await findAndUpdateDataSource(db, surveyCode);

  for (let i = 0; i < questions.length; i++) {
    await findOrCreateDataSource(db, {
      code: questions[i].code,
      type: 'dataElement',
      service_type: 'tupaia',
    });
  }
};

const deleteDataSources = async (db, surveyCode) => {
  const dataGroupSourceResults = await db.runSql(`
    SELECT * FROM data_source WHERE code = '${surveyCode}' AND type = 'dataGroup';
  `);
  const dataGroupSource = dataGroupSourceResults.rows[0];
  if (!dataGroupSource) {
    // This could be a new survey, added after the `up` migration run
    return;
  }

  const { rows: dataElementDataGroups } = await db.runSql(`
  SELECT * FROM data_element_data_group WHERE data_group_id = '${dataGroupSource.id}';
`);

  await db.runSql(`
    DELETE from data_element_data_group WHERE data_group_id = '${dataGroupSource.id}';
    DELETE FROM data_source WHERE id IN (${arrayToDbString([
      dataGroupSource.id,
      ...dataElementDataGroups.map(({ data_element_id: dataElementId }) => dataElementId),
    ])});
  `);
};

const surveyCodes = ['FLWV', 'DS', 'DTC', 'APS', 'FWV'];

exports.up = async function (db) {
  const surveys = await selectSurveysByCode(db, surveyCodes);
  for (let i = 0; i < surveys.length; i++) {
    const surveyCode = surveys[i].code;
    const questions = await selectQuestionsBySurveyCode(db, surveyCode);
    await insertDataSources(db, questions, surveyCode);
  }

  // Perform a full refresh as the auto fast refresh that occurs post migration cannot handle this much data
  await db.runSql(`
    SELECT mv$removeIndexFromMv$Table(mv$buildAllConstants(), 'analytics_data_element_entity_date_idx');
    SELECT mv$removeIndexFromMv$Table(mv$buildAllConstants(), 'analytics_data_group_entity_event_date_idx');
    SELECT mv$refreshMaterializedView('analytics', 'public');
    SELECT mv$addIndexToMv$Table(mv$buildAllConstants(), 'public', 'analytics', 'analytics_data_element_entity_date_idx', 'data_element_code, entity_code, date desc');
    SELECT mv$addIndexToMv$Table(mv$buildAllConstants(), 'public', 'analytics', 'analytics_data_group_entity_event_date_idx', 'data_group_code, entity_code, event_id, date desc');
  `);
};

exports.down = async function (db) {
  const surveys = await selectSurveysByCode(db, surveyCodes);
  for (let i = 0; i < surveys.length; i++) {
    await deleteDataSources(db, surveys[i].code);
  }

  // Perform a full refresh as the auto fast refresh that occurs post migration cannot handle this much data
  await db.runSql(`
    SELECT mv$removeIndexFromMv$Table(mv$buildAllConstants(), 'analytics_data_element_entity_date_idx');
    SELECT mv$removeIndexFromMv$Table(mv$buildAllConstants(), 'analytics_data_group_entity_event_date_idx');
    SELECT mv$refreshMaterializedView('analytics', 'public');
    SELECT mv$addIndexToMv$Table(mv$buildAllConstants(), 'public', 'analytics', 'analytics_data_element_entity_date_idx', 'data_element_code, entity_code, date desc');
    SELECT mv$addIndexToMv$Table(mv$buildAllConstants(), 'public', 'analytics', 'analytics_data_group_entity_event_date_idx', 'data_group_code, entity_code, event_id, date desc');
  `);
};

exports._meta = {
  version: 1,
};
