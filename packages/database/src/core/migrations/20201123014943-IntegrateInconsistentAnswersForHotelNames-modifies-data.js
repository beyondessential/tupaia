'use strict';

import { updateValues } from '../utilities';

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

const convertData = [
  { incorrectNames: ['9'], correctName: 'HQ - Matautu Uta' },
  { incorrectNames: ['Dave Eco Lodge', 'Dave Parker Eco Lodge'], correctName: "Dave's Eco Lodge" },
  {
    incorrectNames: ['Home - Lotopa mamoga 2', 'Home - Lotopa mamoga 3'],
    correctName: 'Home - Lotopa mamoga',
  },
  { incorrectNames: ['home - avele'], correctName: 'Home - Avele' },
  { incorrectNames: ['Home - Ululoloa'], correctName: 'Home - Ululoloa Riverside' },
  { incorrectNames: ['Home - Vailima'], correctName: 'Home - Vailima Australian High Commission' },
  { incorrectNames: ['Home - Vaivase'], correctName: 'Home - Vaivase uta' },
  { incorrectNames: ['Insel'], correctName: 'Insel Hotel' },
  { incorrectNames: ['Karls Getaway'], correctName: "Karl's Getaway" },
  {
    incorrectNames: ['lynns getaway', 'Lynns Getaway'],
    correctName: "Lynn's Getaway",
  },
  { incorrectNames: ['Pasifika Inn'], correctName: 'Pasefika Inn' },
  { incorrectNames: ['Samoa Tradition'], correctName: 'Samoa Traditional Resort' },
  { incorrectNames: ['sheraton'], correctName: 'Sheraton' },
  { incorrectNames: ['Shrine of the Three Hearts'], correctName: 'Shrine of Three Hearts' },
  { incorrectNames: ['Talanoa Fale'], correctName: 'Talanoa Fales' },
  { incorrectNames: ['Travellers Point'], correctName: "Traveller's Point" },
  { incorrectNames: ['Vaea'], correctName: 'Vaea Hotel' },
  { incorrectNames: ['vaiala beach fales'], correctName: 'Vaiala Beach Fales' },
  { incorrectNames: ['Vaiala Beach Fale'], correctName: 'Vaiala Beach Fales' },
  { incorrectNames: ['Vaivase Accomadation'], correctName: 'Vaivase Accommodation' },
];

function checkHotelName(answer) {
  for (const { incorrectNames, correctName } of convertData) {
    if (incorrectNames.includes(answer.text)) return { id: answer.id, text: correctName };
  }
  return null;
}

const surveyId = '5f62bcbe61f76a2603093a3f'; // SC1QMIA

exports.up = async function (db) {
  // trim all site names
  await db.runSql(`
    update answer 
    set "text" = TRIM(text) 
    where id in (
      select a.id from answer a 
      join question q on a.question_id = q.id 
      join survey_response sr on sr.id = a.survey_response_id and sr.survey_id = '${surveyId}'
      where q.text = 'Quarantine Site');
  `);

  const { rows: answers } = await db.runSql(`
    select a.id, a."text" from answer a 
    join question q on a.question_id = q.id
    join survey_response sr on sr.id = a.survey_response_id 
        and sr.survey_id = '${surveyId}' 
    where q.text = 'Quarantine Site'
  `);
  const trimAnswers = answers.map(a => ({ ...a, text: a.text.trim() }));
  for (const answer of trimAnswers) {
    const newAnswer = checkHotelName(answer);
    if (newAnswer) await updateValues(db, 'answer', { text: newAnswer.text }, { id: newAnswer.id });
  }
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
