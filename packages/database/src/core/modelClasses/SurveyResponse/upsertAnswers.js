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
  /** @type {import('../Answer').AnswerRecord[]} */
  const answerRecords = [];

  for (const answer of answers) {
    const answerDocument = {
      id: answer.id,
      question_id: answer.question_id,
      survey_response_id: surveyResponseId,
      text: await getAnswerText(answer, answerBodyParsers),
      type: answer.type,
    };

    try {
      /** @type {import('../Answer').AnswerRecord} */
      const answerRecord = await models.answer.updateOrCreate(
        { survey_response_id: surveyResponseId, question_id: answer.question_id },
        answerDocument,
      );
      answerRecords.push(answerRecord);
    } catch (error) {
      throw new DatabaseError(
        `Saving answer ${answer.id ?? ''} for question ${answer.question_id} of survey response ${surveyResponseId}`,
        error,
      );
    }
  }

  return answerRecords;
}
