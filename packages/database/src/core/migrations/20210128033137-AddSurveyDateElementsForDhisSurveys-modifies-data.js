'use strict';

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

const selectDhisSurveysWithMissingSurveyDateElements = async db => {
  const { rows } = await db.runSql(`
    SELECT s.* FROM survey s
    JOIN data_source ds ON ds.id = s.data_source_id
    LEFT JOIN data_source de on de.code = CONCAT(s.code, 'SurveyDate')
    WHERE ds.service_type = 'dhis' AND de.id IS NULL
  `);

  return rows;
};

const insertSurveyDateElementsAndElementGroups = async (db, surveys) => {
  for (const { code: surveyCode, data_source_id: dataGroupId } of surveys) {
    const dataElementId = generateId();
    await insertObject(db, 'data_source', {
      id: dataElementId,
      code: `${surveyCode}SurveyDate`,
      type: 'dataElement',
      service_type: 'dhis',
      config: { isDataRegional: true },
    });
    await insertObject(db, 'data_element_data_group', {
      id: generateId(),
      data_element_id: dataElementId,
      data_group_id: dataGroupId,
    });
  }
};

exports.up = async function (db) {
  const surveys = await selectDhisSurveysWithMissingSurveyDateElements(db);
  await insertSurveyDateElementsAndElementGroups(db, surveys);
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
