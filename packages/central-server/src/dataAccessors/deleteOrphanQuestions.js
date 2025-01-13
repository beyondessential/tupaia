import { RECORDS, JOIN_TYPES } from '@tupaia/database';

/**
 * Delete all questions that aren't included in any survey
 */
export async function deleteOrphanQuestions(models) {
  const subQueryName = 'unusedQuestion';
  const orphanQuestions = await models.database.find(
    subQueryName,
    { [`${RECORDS.ANSWER}.id`]: null },
    {
      recordType: subQueryName,
      joinWith: RECORDS.ANSWER,
      joinCondition: [`${subQueryName}.id`, `${RECORDS.ANSWER}.question_id`],
      joinType: JOIN_TYPES.LEFT_OUTER,
      columns: [`${subQueryName}.id`],
      subQuery: {
        name: subQueryName,
        recordType: RECORDS.QUESTION,
        joinWith: RECORDS.SURVEY_SCREEN_COMPONENT,
        joinType: JOIN_TYPES.LEFT_OUTER,
        where: {
          [`${RECORDS.SURVEY_SCREEN_COMPONENT}.id`]: null,
        },
        columns: [`${RECORDS.QUESTION}.id`],
      },
    },
  );
  for (const orphanQuestion of orphanQuestions) {
    await models.question.delete({ id: orphanQuestion.id });
  }
}
