// These questions were detected as having multiple questions under the same code during the
// 20190626043217-MakeQuestionCodeUnique migration to add the question.code unique constraint
const DUPLICATE_TO_MASTER_QUESTION_ID = {
  '59085feacc42a44705c036e8': '59085fd6cc42a44705c03164',
  '59085fadcc42a44705c02d10': '59085fd6cc42a44705c03160',
  '59085feacc42a44705c036d8': '59085fd6cc42a44705c03160',
  '59085fd7cc42a44705c03258': '59085fe8cc42a44705c033c0',
};

// Moves the answer from its current (duplicate and deprecated) question, to the master question
export async function deduplicateQuestion({ answer }) {
  const masterQuestionId = DUPLICATE_TO_MASTER_QUESTION_ID[answer.question_id];

  if (!masterQuestionId) {
    throw new Error('This question has not had a master question id defined');
  }

  answer.question_id = masterQuestionId; // eslint-disable-line no-param-reassign
  await answer.save();
}
