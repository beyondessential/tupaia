/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { assertSurveyEditPermissions } from '../surveys';

export const assertQuestionEditPermissions = async (accessPolicy, models, questionId) => {
  const question = await models.question.findById(questionId);
  if (!question) {
    throw new Error(`No question exists with id ${questionId}`);
  }

  const surveyIds = await question.getSurveyIds();
  for (let i = 0; i < surveyIds.length; ++i) {
    await assertSurveyEditPermissions(
      accessPolicy,
      models,
      surveyIds[i],
      'Requires permission to all surveys the question appears in',
    );
  }

  return true;
};
