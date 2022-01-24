/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { assertDataElementPermissions } from '../dataElements/assertDataElementPermissions';

export const assertQuestionEditPermissions = async (accessPolicy, models, questionId) => {
  const question = await models.question.findById(questionId);
  if (!question) {
    throw new Error(`No question exists with id ${questionId}`);
  }
  return assertDataElementPermissions(question.data_element_code);
};
