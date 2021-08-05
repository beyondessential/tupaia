/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

/**
 * Replace question code with question UUID in an expression.
 *
 * Important: This function also assumes that all the variables in an expression have prefix '$'
 * because some question codes can start with numbers.
 *
 * Eg:
 * ($SchFF00Section1Total / $SchFF00Section1TotalObtainable) * 100
 * will be converted to:
 * ($5ed7558b61f76a6ba5003114 / $5ec5bf8961f76a18ad00d4f9) * 100
 * @param {*} models
 * @param {*} expression Expression to evaluate (assumes that all the variables in an expression have prefix '$')
 * @param {*} codes: List of question codes (with no prefix $)
 */
export const translateExpression = async (models, rawExpression, codes) => {
  const questionCodeToId = await models.question.findIdByCode(codes);
  let expression = rawExpression;

  for (const code of codes) {
    const questionId = questionCodeToId[code];
    // Retain the $ prefix, as UUID often starts with a number (breaks evaluation in mathjs)
    expression = expression.replace(`$${code}`, `$${questionId}`);
  }

  return expression;
};
