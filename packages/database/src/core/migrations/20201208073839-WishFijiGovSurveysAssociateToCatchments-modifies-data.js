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

// [code, name]
const oldCatchment = ['FJ_CATCH_Namosi', 'Namosi Catchment'];
const newCatchment = ['FJ_CATCH_Upper_Navua', 'Upper Navua Catchment'];

const originalEntityId = '5df8072d61f76a485c2eb9f3'; // CWMH Suva Hospital

const updateCatchment = (db, code, updateCode, updateName) =>
  db.runSql(`
    update entity 
    set code = '${updateCode}', name = '${updateName}' 
    where code = '${code}';
  `);

const catchmentNameToCode = {
  Bureta: 'FJ_CATCH_Bureta',
  Dama: 'FJ_CATCH_Dama',
  Dawasamu: 'FJ_CATCH_Dawasamu',
  'Upper Navua': 'FJ_CATCH_Upper_Navua',
  Waibula: 'FJ_CATCH_Waibula',
};

const fetchSurveyResponseCatchments = db =>
  db.runSql(`
    select sr.id, a.text as name
    from answer a 
    join survey_response sr on a.survey_response_id = sr.id 
    join question q on a.question_id = q.id and q.code in ('WFIGM5', 'WFIGMMET4')
    join survey s on sr.survey_id = s.id and s.code IN ('WISH_2GM', 'WISH_2GMM');
  `);

const updateSurveyResponseRow = (db, surveyResponseId, code) =>
  db.runSql(`
    update survey_response 
    set entity_id = (select id from entity where code = '${code}')
    where id = '${surveyResponseId}' 
  `);

const updateSurveyResponseEntities = async (db, surveyResponses) =>
  surveyResponses.forEach(async sr => {
    await updateSurveyResponseRow(db, sr.id, catchmentNameToCode[sr.name]);
  });

const deleteDeprecatedAnswers = db =>
  db.runSql(`
    delete from answer a
    where id in (
      select a.id
      from answer a
      inner join question q
      on a.question_id = q.id
      where q.code = 'WFIGM5' OR q.code = 'WFIGMMET4'
    );
  `);

exports.up = async function (db) {
  await updateCatchment(db, oldCatchment[0], newCatchment[0], newCatchment[1]);
  const surveyResponses = (await fetchSurveyResponseCatchments(db)).rows;
  await updateSurveyResponseEntities(db, surveyResponses);
  return deleteDeprecatedAnswers(db);
};

exports.down = async function (db) {
  await updateCatchment(db, newCatchment[0], oldCatchment[0], oldCatchment[1]);
};

exports._meta = {
  version: 1,
};
