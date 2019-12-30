'use strict';

var dbm;
var type;
var seed;

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

const TONGA_VILLAGE_QUESTION_CODES = [
  'CD6',
  'CD2_3',
  'CD3a_004',
  'CD3b_005',
  'CD3b_005a',
  'CD4_004',
  'CD93',
  'CH286',
  'CH451',
  'HP2',
  'HP29',
  'HP238',
  'HP279',
];
const NON_PRIMARY_ENTITY_QUESTIONS = ['CD3a_004', 'CD3b_005', 'CD3b_005a'];
const generateQuestionIdsSqlFromCodes = questionCodes => `answer.question_id IN (SELECT id FROM question WHERE code IN (
    ${questionCodes.map(c => `'${c}'`).join(',')}
  ))`;

// some village names are different in the entity import file vs. existing autocomplete
// this is a non-exhaustive list of those exceptions that cover all actual answers submitted by the
// 9th December 2019 (1094 answers where question.type = Autocomplete and question.text = Village)
const AUTOCOMPLETE_TEXT_TO_ENTITY_NAME_EXCEPTIONS = {
  'Houma (Houma)': 'Houma (Tongatapu)',
  "Holonga (Leimatu''a)": "Holonga (Vava''u)",
  "Holonga (Mu''a 1)": 'Holonga (Tongatapu)',
  'Masilamea (Kolovai)': 'Masilamea (Tongatapu)',
  "Mataika (Leimatu''a)": "Mataika (Vava''u)",
};

exports.up = async function(db) {
  const updateExceptionalAnswersSql = Object.entries(AUTOCOMPLETE_TEXT_TO_ENTITY_NAME_EXCEPTIONS)
    .map(
      ([answerText, entityName]) => `
      UPDATE answer SET text = '${entityName}' WHERE text = '${answerText}' AND ${generateQuestionIdsSqlFromCodes(
        TONGA_VILLAGE_QUESTION_CODES,
      )};
    `,
    )
    .join('\n');
  await db.runSql(`
    ${updateExceptionalAnswersSql}

    UPDATE answer SET text = entity.id, type = 'PrimaryEntity' FROM entity WHERE entity.name = answer.text AND entity.type = 'village' AND ${generateQuestionIdsSqlFromCodes(
      TONGA_VILLAGE_QUESTION_CODES,
    )};

    UPDATE answer SET type = 'Entity' WHERE ${generateQuestionIdsSqlFromCodes(
      NON_PRIMARY_ENTITY_QUESTIONS,
    )};
  `);
  return null;
};

exports.down = async function(db) {
  const updateExceptionalAnswersSql = Object.entries(AUTOCOMPLETE_TEXT_TO_ENTITY_NAME_EXCEPTIONS)
    .map(
      ([answerText, entityName]) => `
      UPDATE answer SET text = ${answerText} WHERE text = ${entityName} AND ${questionIdsSql}
    `,
    )
    .join('\n');
  await db.runSql(`
    UPDATE answer SET text = entity.name FROM entity WHERE entity.id = answer.text AND ${questionIdsSql};

    ${updateExceptionalAnswersSql}
  `);
  return null;
};

exports._meta = {
  version: 1,
};
