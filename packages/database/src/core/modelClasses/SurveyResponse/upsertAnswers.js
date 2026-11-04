import { DatabaseError } from '@tupaia/utils';
import { getAnswerText } from './getAnswerText';

/**
 * @typedef {import('@tupaia/types').Answer} Answer
 * @typedef {(answer: Answer) => Promise<Answer["text"]>} AnswerBodyParser
 */

/**
 * Max total answer text per INSERT. Photo answers are inline base64, so one response can be
 * ~100 MB. Inserting that in one statement breaks PGlite on OPFS in DataTrak: it runs out of file
 * handles mid-statement and the connection is left unusable. Smaller statements avoid this.
 */
export const MAX_BATCH_TEXT_LENGTH = 5 * 1024 * 1024;

/**
 * Groups answers into batches whose total text length is at most `maxLength`. An answer that is
 * too big on its own goes in a batch by itself.
 */
export const batchByTextLength = (answers, maxLength = MAX_BATCH_TEXT_LENGTH) => {
  const batches = [];
  let batch = [];
  let batchLength = 0;

  for (const answer of answers) {
    const length = answer.text?.length ?? 0;

    const batchIsFull = batch.length > 0 && batchLength + length > maxLength;
    if (batchIsFull) {
      batches.push(batch);
      batch = [];
      batchLength = 0;
    }

    batch.push(answer);
    batchLength += length;
  }

  if (batch.length > 0) batches.push(batch);
  return batches;
};

const upsertInBatches = async (models, answers, columnsToMerge) => {
  const records = [];
  for (const batch of batchByTextLength(answers)) {
    const batchRecords = await models.answer.createMany(batch, {
      onConflictMerge: ['survey_response_id', 'question_id'],
      columnsToMerge,
    });
    records.push(...batchRecords);
  }
  return records;
};

/**
 * @param {import('../../ModelRegistry').ModelRegistry} models
 * @param {Answer[]} answers
 * @param {import('@tupaia/types').SurveyResponse["id"]} surveyResponseId
 * @param {Record<import('@tupaia/types').QuestionType, AnswerBodyParser> | undefined} [answerBodyParsers]
 * @returns {Promise<import('../Answer').AnswerRecord[]>}
 */
export async function upsertAnswers(models, answers, surveyResponseId, answerBodyParsers) {
  // One answer per question, last one wins. A single upsert can't update the same row twice.
  const answersByQuestionId = new Map(answers.map(answer => [answer.question_id, answer]));

  const answerRecords = [];
  for (const answer of answersByQuestionId.values()) {
    try {
      answerRecords.push({
        id: answer.id,
        question_id: answer.question_id,
        survey_response_id: surveyResponseId,
        text: await getAnswerText(answer, answerBodyParsers),
        type: answer.type,
      });
    } catch (error) {
      throw new DatabaseError(
        `Saving answer ${answer.id ?? ''} for question ${answer.question_id} of survey response ${surveyResponseId}`,
        error,
      );
    }
  }

  // If the caller gave an id, it overwrites the existing row's id. If not, the existing id is kept.
  const withId = answerRecords.filter(answer => answer.id);
  const withoutId = answerRecords.filter(answer => !answer.id).map(({ id, ...answer }) => answer);

  try {
    return [
      ...(await upsertInBatches(models, withId, ['id', 'text', 'type'])),
      ...(await upsertInBatches(models, withoutId, ['text', 'type'])),
    ];
  } catch (error) {
    throw new DatabaseError(`Saving answers of survey response ${surveyResponseId}`, error);
  }
}
