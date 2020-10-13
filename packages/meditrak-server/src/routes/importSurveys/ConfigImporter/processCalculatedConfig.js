/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { getVariables } from '@beyondessential/arithmetic';
import { splitStringOn, splitStringOnComma } from '../../utilities';

export const processCalculatedConfig = async (models, config) => {
  let translatedConfig = {
    formula: await translateFormula(models, config.formula),
    defaultValues: await translateDefaultValues(models, config.defaultValues),
  };

  if (config.values) {
    translatedConfig = {
      ...translatedConfig,
      values: await translateValues(models, config.values),
    };
  }

  return translatedConfig;
};

const translateFormula = async (models, formula) => {
  let translatedFormula = formula;
  const codes = getVariables(formula);

  for (let i = 0; i < codes.length; i++) {
    const code = codes[i];
    const { id: questionId } = await models.question.findOne({ code });
    translatedFormula = translatedFormula.replace(code, questionId);
  }

  return translatedFormula;
};

const translateDefaultValues = async (models, defaultValuesConfig) => {
  const defaultValues = splitStringOnComma(defaultValuesConfig);
  const translatedDefaultValues = {};

  for (let i = 0; i < defaultValues.length; i++) {
    const [code, defaultValue] = splitStringOn(defaultValues[i], '=');
    const { id: questionId } = await models.question.findOne({ code });
    translatedDefaultValues[questionId] = defaultValue;
  }

  return translatedDefaultValues;
};

const translateValues = async (models, valuesConfig) => {
  const values = splitStringOnComma(valuesConfig);
  const translatedValues = {};

  for (let i = 0; i < values.length; i++) {
    const [code, value] = splitStringOn(values[i], '=');
    const [questionCode, questionOption] = splitStringOn(code, '.');
    const { id: questionId } = await models.question.findOne({ code: questionCode });

    if (!translatedValues[questionId]) {
      translatedValues[questionId] = {};
    }
    translatedValues[questionId][questionOption] = value;
  }

  return translatedValues;
};
