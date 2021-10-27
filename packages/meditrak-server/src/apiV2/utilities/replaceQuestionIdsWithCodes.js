/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

export const replaceQuestionIdsWithCodes = async (models, rawExpression, ids, options) => {
  const { useDollarPrefixes } = options;
  let expression = rawExpression;

  for (const id of ids) {
    const question = await models.question.findById(id);
    // Using the global regular expression ensures we replace all instances
    expression = expression.replace(
      new RegExp(`${useDollarPrefixes ? '\\$' : ''}${id}`, 'g'),
      `${useDollarPrefixes ? '$' : ''}${question?.code || `No question with id: ${id}`}`,
    );
  }
  console.log({ rawExpression, expression, ids });

  return expression;
};
