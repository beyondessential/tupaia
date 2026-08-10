import { DatabaseError } from '@tupaia/utils';
import { getAnswerText } from './getAnswerText';

/**
 * @typedef {import('@tupaia/types').Answer} Answer
 * @typedef {(answer: Answer) => Promise<Answer["text"]>} AnswerBodyParser
 * @param {import('../../ModelRegistry').ModelRegistry} models
 * @param {Answer[]} answers
 * @param {import('@tupaia/types').SurveyResponse["id"]} surveyResponseId
 * @param {Record<import('@tupaia/types').QuestionType, AnswerBodyParser> | undefined} [answerBodyParsers]
 * @returns {Promise<import('../Answer').AnswerRecord[]>}
 */
export async function upsertAnswers(models, answers, surveyResponseId, answerBodyParsers) {
  // Dedupe on the conflict key, last write wins, matching the sequential upsert behaviour this
  // replaces. A multi-row INSERT ... ON CONFLICT DO UPDATE cannot affect the same row twice.
  /** @type {Map<Answer["question_id"], Answer>} */
  const answersByQuestionId = new Map();
  for (const answer of answers) {
    answersByQuestionId.set(answer.question_id, answer);
  }

  const answerDocuments = [];
  for (const answer of answersByQuestionId.values()) {
    try {
      answerDocuments.push({
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

  // Batch all answers into a single multi-row upsert (chunked internally if very large), rather
  // than one query per answer. When an id is explicitly provided it is applied on conflict, same
  // as updateOrCreate did; generated ids must not overwrite the existing row's id, so those
  // records are upserted separately without id in the merge column list.
  const withExplicitId = answerDocuments.filter(document => document.id);
  const withGeneratedId = answerDocuments.filter(document => !document.id);

  const conflictColumns = ['survey_response_id', 'question_id'];

  try {
    /** @type {import('../Answer').AnswerRecord[]} */
    const answerRecords = [];
    if (withExplicitId.length > 0) {
      answerRecords.push(
        ...(await models.answer.createMany(withExplicitId, {
          onConflictMerge: conflictColumns,
          columnsToMerge: ['id', 'text', 'type'],
        })),
      );
    }
    if (withGeneratedId.length > 0) {
      answerRecords.push(
        ...(await models.answer.createMany(
          withGeneratedId.map(({ id, ...document }) => document),
          {
            onConflictMerge: conflictColumns,
            columnsToMerge: ['text', 'type'],
          },
        )),
      );
    }
    return answerRecords;
  } catch (error) {
    throw new DatabaseError(`Saving answers of survey response ${surveyResponseId}`, error);
  }
}
