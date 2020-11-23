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
    incorrectNames: ['lynns getaway', 'Lynns Getaway', 'Lynns Getaway'],
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
  const newAnswer = answer;
  convertData.forEach(({ incorrectNames, correctName }) => {
    if (incorrectNames.includes(answer.text)) {
      newAnswer.text = correctName;
    }
  });
  return newAnswer;
}

exports.up = async function (db) {
  let { rows: answers } = await db.runSql(`
    select a.id, a."text" from answer a 
    join question q on a.question_id = q.id 
    where q.text = 'Quarantine Site'
  `);
  answers = answers.map(a => ({ ...a, text: a.text.trim() }));
  for (const answer of answers) {
    const newAnswer = checkHotelName(answer);
    await updateValues(db, 'answer', { text: newAnswer.text }, { id: newAnswer.id });
  }
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
