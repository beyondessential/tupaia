/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

/**
 * We want to order the codes such that no code is a substring of a later code
 * This avoids bugs when replacing the values in the regex, as we don't accidentally replace
 * a substring
 * @param {string[]} codes
 */
const sortByFewestSubstrings = codes => {
  const codesAndNumSubstrings = codes.map(code => [
    code,
    codes.filter(otherCode => otherCode !== code && otherCode.includes(code)).length,
  ]);
  const codesOrderedByFewestSubstrings = codesAndNumSubstrings
    .sort(([, numSubstrings1], [, numSubstrings2]) => numSubstrings1 - numSubstrings2)
    .map(([code]) => code);
  return codesOrderedByFewestSubstrings;
};

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
 *
 * Inverse operation: replaceQuestionIdsWithCodes
 * @param {*} models
 * @param {*} expression Expression to evaluate (assumes that all the variables in an expression have prefix '$')
 * @param {*} codes: List of question codes (with no prefix $)
 */
export const translateExpression = async (models, rawExpression, codes) => {
  const questionCodeToId = await models.question.findIdByCode(codes);
  let expression = rawExpression;
  const codesOrderedByFewestSubstrings = sortByFewestSubstrings(codes);
  for (const code of codesOrderedByFewestSubstrings) {
    const questionId = questionCodeToId[code];
    // Retain the $ prefix, as UUID often starts with a number (breaks evaluation in mathjs)
    // Using the global regular expression ensures we replace all instances
    expression = expression.replace(new RegExp(`\\$${code}`, 'g'), `$${questionId}`);
  }

  return expression;
};
