/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import { TYPES, JOIN_TYPES } from '@tupaia/database';

/**
 * Delete all questions that aren't included in any survey
 */
export async function deleteOrphanQuestions(models) {
  const subQueryName = 'unusedQuestion';
  const orphanQuestions = await models.database.find(
    subQueryName,
    { [`${TYPES.ANSWER}.id`]: null },
    {
      recordType: subQueryName,
      joinWith: TYPES.ANSWER,
      joinCondition: [`${subQueryName}.id`, `${TYPES.ANSWER}.question_id`],
      joinType: JOIN_TYPES.LEFT_OUTER,
      columns: [`${subQueryName}.id`],
      subQuery: {
        name: subQueryName,
        recordType: TYPES.QUESTION,
        joinWith: TYPES.SURVEY_SCREEN_COMPONENT,
        joinType: JOIN_TYPES.LEFT_OUTER,
        where: {
          [`${TYPES.SURVEY_SCREEN_COMPONENT}.id`]: null,
        },
        columns: [`${TYPES.QUESTION}.id`],
      },
    },
  );
  for (const orphanQuestion of orphanQuestions) {
    await models.question.delete({ id: orphanQuestion.id });
  }
}
