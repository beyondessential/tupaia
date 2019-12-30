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

const DUPLICATE_QUESTIONS = {
  DP15: {
    master: '59085fd6cc42a44705c03164',
    duplicates: ['59085feacc42a44705c036e8'],
  },
  BCD95: {
    master: '59085fd6cc42a44705c03160',
    duplicates: ['59085feacc42a44705c036d8', '59085fadcc42a44705c02d10'],
  },
  DP64: {
    master: '59085fe8cc42a44705c033c0',
    duplicates: ['59085fd7cc42a44705c03258'],
  },
};

exports.up = async function(db) {
  // Update all null code questions to use id (100 of them, all Instruction type questions)
  await db.runSql(`
    UPDATE "question"
      SET "code" = "id"
        WHERE "code" IS NULL OR "code" = '';
  `);

  // Swap out duplicate questions in survey_screen_components and answers
  const duplicatedQuestionCodes = Object.keys(DUPLICATE_QUESTIONS);
  for (let i = 0; i < duplicatedQuestionCodes.length; i++) {
    const { master, duplicates } = DUPLICATE_QUESTIONS[duplicatedQuestionCodes[i]];
    const duplicateIds = `(${duplicates.map(duplicateId => `'${duplicateId}'`).join(',')})`;
    // Shift survey screen components to master question
    await db.runSql(`
      UPDATE "survey_screen_component"
        SET "question_id" = '${master}'
          WHERE "question_id" IN ${duplicateIds};
    `);

    // Delete any answers that are in survey responses that also have an answer to the master
    await db.runSql(`
      DELETE FROM "answer"
        WHERE "question_id" IN ${duplicateIds}
          AND "survey_response_id" IN (
            SELECT "survey_response_id" FROM "answer"
              WHERE "question_id" = '${master}'
          );
    `);

    // Shift any answers in other survey responses from the duplicate to the master question
    await db.runSql(`
      UPDATE "answer"
        SET "question_id" = '${master}'
          WHERE "question_id" IN ${duplicateIds};
    `);

    // Update the code of duplicate questions (don't delete, as users may still have the old version
    // in which case deleting the question entirely will break sync for them if they happen to fill
    // in a survey with one of these questions _before_ they next sync)
    await db.runSql(`
      UPDATE "question"
        SET
          "code" = "code" || '_duplicate_' || "id",
          "text" = 'This question was a duplicate, and has been replaced by its master question, ${master}. It remains here so users can still sync to it. The hook will move answers over to the non-duplicate question id.',
          "hook" = 'deduplicateQuestion'
        WHERE "id" IN ${duplicateIds};
    `);
  }

  // Add the unique constraint
  await db.runSql(`
    ALTER TABLE "question"
      ADD CONSTRAINT question_code_unique
        UNIQUE ("code");
  `);
};

exports.down = function(db) {
  // Drop the unique constraint
  return db.runSql(`
    ALTER TABLE "question"
      DROP CONSTRAINT question_code_unique;
  `);
};

exports._meta = {
  version: 1,
};
