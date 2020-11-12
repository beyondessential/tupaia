/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

/**
 * Replace question code with question UUID in an expression.
 * Also prefix UUIDs with '$' so that it can be used in mathjs later on.
 *
 * Eg:
 * (SchFF00Section1Total / SchFF00Section1TotalObtainable) * 100
 * will be converted to:
 * ($5ed7558b61f76a6ba5003114 / $5ec5bf8961f76a18ad00d4f9) * 100
 * @param {*} models
 * @param {*} formula
 * @param {*} codes
 */
export const translateExpression = async (models, formula, codes) => {
  let translatedFormula = formula;

  for (const code of codes) {
    const { id: questionId } = await models.question.findOne({ code });
    // UUID often starts with a number which is invalid when evaluating using mathjs
    translatedFormula = translatedFormula.replace(code, `$${questionId}`);
  }

  return translatedFormula;
};
