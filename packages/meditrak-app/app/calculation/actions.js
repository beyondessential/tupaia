/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { getVariables, runArithmetic } from '@beyondessential/arithmetic';
import { getAnswerForQuestion, getQuestion } from '../assessment/selectors';

export const calculateArithmetic = questionId => (dispatch, getState) => {
  const { config } = getQuestion(state, questionId);
  const { formula, defaultValues, values: optionValues } = config;
  const values = {};
  const state = getState();
  const variables = getVariables(formula);
  let translatedFormula = formula;

  Object.entries(variables).forEach(questionIdVariable => {
    let answer = getAnswerForQuestion(state, questionIdVariable);
    if (
      optionValues &&
      optionValues[questionIdVariable] &&
      optionValues[questionIdVariable][answer]
    ) {
      answer = optionValues[questionIdVariable][answer];
    }
    if (!answer) {
      answer = defaultValues[questionIdVariable];
    }

    values[questionIdVariable] = answer;
    translatedFormula = translatedFormula.replace(questionIdVariable, answer);
  });

  dispatch({
    translatedFormula,
    calculatedResult: runArithmetic(formula, values),
  });
};
