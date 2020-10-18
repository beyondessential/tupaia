/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { getVariables } from '@beyondessential/arithmetic';
import { splitStringOn, splitStringOnComma } from '../../utilities';

const OPERATOR_TRANSLATIONS = {
  GT: '>',
  GE: '>=',
  LT: '<',
  LE: '<=',
  EQ: '=',
};

export const processCalculatedConfig = async (models, config) => {
  const calculatedConfig = await processCalculatedConfigByType(models, config);
  return {
    type: config.type,
    ...calculatedConfig,
  };
};

const processCalculatedConfigByType = async (models, config) => {
  switch (config.type) {
    case 'arithmetic':
      return translateArithmeticConfig(models, config);
    case 'conditional':
      return translateConditionalConfig(models, config);
    default:
      throw new Error(`Invalid calculated type: ${config.type}`);
  }
};

const translateArithmeticConfig = async (models, config) => {
  const codes = getVariables(config.formula);

  let translatedConfig = {
    formula: await translateFormula(models, config.formula, codes),
  };

  if (config.defaultValues) {
    translatedConfig = {
      ...translatedConfig,
      defaultValues: await translateDefaultValues(models, config.defaultValues),
    };
  }

  if (config.valueTranslation) {
    translatedConfig = {
      ...translatedConfig,
      valueTranslation: await translateValueTranslation(models, config.valueTranslation),
    };
  }

  if (config.text) {
    translatedConfig = {
      ...translatedConfig,
      text: await translateText(models, config.text, codes),
    };
  }

  return translatedConfig;
};

/**
 * formula: (SchFF00Section1Total / SchFF00Section1TotalObtainable) * 100
 * will be converted to:
 * formula: (5ed7558b61f76a6ba5003114 / 5ec5bf8961f76a18ad00d4f9) * 100
 * @param {*} models
 * @param {*} formula
 * @param {*} codes
 */
const translateFormula = async (models, formula, codes) => {
  let translatedFormula = formula;

  for (let i = 0; i < codes.length; i++) {
    const code = codes[i];
    const { id: questionId } = await models.question.findOne({ code });
    translatedFormula = translatedFormula.replace(code, questionId);
  }

  return translatedFormula;
};

/**
 * defaultValues: SchFF00Section1Total=0,SchFF00Section1TotalObtainable=0
 * will be converted to:
 * defaultValues:{
 *     5ed7558b61f76a6ba5003114:0,
 *     5ec5bf8961f76a18ad00d4f9:0
 * },
 * @param {*} models
 * @param {*} defaultValuesConfig
 */
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

/**
 * valueTranslation: SchCVD016a.Yes=3,SchCVD016a.No=0
 * will be converted to:
 * valueTranslation: {
 *		5ed7558b61f76a6ba5003114: { Yes: 3, No: 0 }
 * }
 * @param {*} models
 * @param {*} valueTranslationConfig
 */
const translateValueTranslation = async (models, valueTranslationConfig) => {
  const valueTranslation = splitStringOnComma(valueTranslationConfig);
  const translatedValueTranslation = {};

  for (let i = 0; i < valueTranslation.length; i++) {
    const [code, value] = splitStringOn(valueTranslation[i], '=');
    const [questionCode, questionOption] = splitStringOn(code, '.');
    const { id: questionId } = await models.question.findOne({ code: questionCode });

    if (!translatedValueTranslation[questionId]) {
      translatedValueTranslation[questionId] = {};
    }
    translatedValueTranslation[questionId][questionOption] = value;
  }

  return translatedValueTranslation;
};

/**
 * text: SchFF00CalcTotal / SchFF00CalcTotalObtainable = $result
 * Question codes will be replaced by question ids
 * @param {*} models
 * @param {*} text
 * @param {*} codes
 */
const translateText = async (models, text, codes) => {
  let translatedText = text;

  for (let i = 0; i < codes.length; i++) {
    const code = codes[i];
    const { id: questionId } = await models.question.findOne({ code });
    translatedText = translatedText.replace(code, questionId);
  }

  return translatedText;
};

const translateConditionalConfig = async (models, config) => {
  return {
    conditions: await translateConditions(models, config.conditions),
  };
};

/**
 * conditions: Yes.SchCVD016a.operator=GE,Yes.SchCVD016a.operand=5,No.SchCVD016a.operator=LT,No.SchCVD016a.operand=5
 * will be converted to:
 * conditions: {
 *	  Yes: {
 *			5ed7558b61f76a6ba5003114: {	operator: '>=',	operand: 5 }
 *		},
 *		No: {
 *      5ed7558b61f76a6ba5003114: { operator: '<', operand: 5 }
 *		},
 *	}
 * @param {*} models
 * @param {*} conditionsConfig
 */
const translateConditions = async (models, conditionsConfig) => {
  const conditions = splitStringOnComma(conditionsConfig);
  const translatedConditions = {};

  for (let i = 0; i < conditions.length; i++) {
    const [key, targetValue] = splitStringOn(conditions[i], '=');
    const [finalValue, questionCode, conditionKey] = splitStringOn(key, '.');
    const { id: questionId } = await models.question.findOne({ code: questionCode });
    if (!translatedConditions[finalValue]) {
      translatedConditions[finalValue] = {};
    }
    if (!translatedConditions[finalValue][questionId]) {
      translatedConditions[finalValue][questionId] = {};
    }
    translatedConditions[finalValue][questionId][conditionKey] =
      conditionKey === 'operator' ? OPERATOR_TRANSLATIONS[targetValue] : targetValue;
  }

  return translatedConditions;
};
