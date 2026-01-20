'use strict';

import { updateValues } from '../utilities/migration';

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

const addressIdQuestionCode = 'QMIA029';
const addressTextQuestionCode = 'QMIA010';
const caseQuestionCode = 'QMIA025';
const samoaEntityId = '5df1b88c61f76a485cd1ca09';
const surveyResponseId = 'survey_response_id';

async function getAnswersByQuestionCode(db, code) {
  return db.runSql(`
        select a.*
        from answer a
        inner join survey_response sr
        on a.survey_response_id = sr.id
        inner join question q
        on a.question_id = q.id
        where q.code in ('${code}');    
  `);
}

async function findEntityByName(db, name) {
  const cleanName = name.replace("'", '').trim();
  if (!name.includes('/'))
    return db.runSql(`
  select * from entity
  where name = '${cleanName}'
`);
  return null;
}

async function changeEntityCaseParentToVillage(db, caseParentMapping) {
  await Promise.all(
    caseParentMapping.map(async cas => {
      const [caseCode, parentId] = Object.entries(cas)[0];
      if (parentId) await updateValues(db, 'entity', { parent_id: parentId }, { code: caseCode });
    }),
  );
}

exports.up = async function (db) {
  const cases = (await getAnswersByQuestionCode(db, caseQuestionCode)).rows;
  const addressIds = (await getAnswersByQuestionCode(db, addressIdQuestionCode)).rows;
  const addressTexts = (await getAnswersByQuestionCode(db, addressTextQuestionCode)).rows;

  const caseParentMapping = await Promise.all(
    cases.map(async currentCase => {
      // Find parent address by question code 'QMIA029'
      const parentAddressId = addressIds.find(
        a => a[surveyResponseId] === currentCase[surveyResponseId],
      );
      if (parentAddressId) return { [currentCase.text]: parentAddressId.text };

      // Find parent address by question code 'QMIA010'
      const parentAddressText = addressTexts.find(
        a => a[surveyResponseId] === currentCase[surveyResponseId],
      );
      if (parentAddressText) {
        const parentId = await findEntityByName(db, parentAddressText.text);
        if (parentId && parentId.rows[0]) {
          return { [currentCase.text]: parentId.rows[0].id };
        }
      }

      // Could not find parent address
      return { [currentCase.text]: undefined };
    }),
  );

  await changeEntityCaseParentToVillage(db, caseParentMapping);
};

exports.down = async function (db) {
  const cases = (await getAnswersByQuestionCode(db, caseQuestionCode)).rows;
  Promise.all(
    cases.map(async cas => {
      await updateValues(db, 'entity', { parent_id: samoaEntityId }, { code: cas.text });
    }),
  );
};

exports._meta = {
  version: 1,
};
