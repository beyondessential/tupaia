import { uniq } from 'es-toolkit';
import {
  splitStringOn,
  splitStringOnComma,
  translateExpression,
  getDollarPrefixedExpressionVariables,
} from '../../../utilities';

export const processArithmeticConfig = async (models, config) => {
  const { formula, defaultValues, valueTranslation, answerDisplayText } = config;
  const codes = getDollarPrefixedExpressionVariables(formula);

  let translatedConfig = {
    formula: await translateExpression(models, formula, codes),
  };

  if (defaultValues) {
    translatedConfig = {
      ...translatedConfig,
      defaultValues: await translateDefaultValues(models, defaultValues),
    };
  }

  if (valueTranslation) {
    translatedConfig = {
      ...translatedConfig,
      valueTranslation: await translateValueTranslation(models, valueTranslation),
    };
  }

  // Note: Only question codes included in the formula will be translated
  if (answerDisplayText) {
    translatedConfig = {
      ...translatedConfig,
      answerDisplayText: await translateAnswerDisplayText(models, answerDisplayText, codes),
    };
  }

  return translatedConfig;
};

/**
 * Excel config
 * defaultValues: SchFF00Section1Total:0,SchFF00Section1TotalObtainable:0
 *
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
  const codeToValue = {};
  defaultValues.forEach(defaultValue => {
    const [code, value] = splitStringOn(defaultValue, ':');
    codeToValue[code] = value;
  });
  const questionCodeToId = await models.question.findIdByCode(Object.keys(codeToValue));

  Object.entries(codeToValue).forEach(([code, value]) => {
    const questionId = questionCodeToId[code];
    translatedDefaultValues[questionId] = value;
  });

  return translatedDefaultValues;
};

/**
 * Excel config
 * valueTranslation: SchCVD016a.Yes:3,SchCVD016a.No:0
 *
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
  const codes = uniq(
    valueTranslation.map(defaultValue => {
      const [code] = splitStringOn(defaultValue, '.');
      return code;
    }),
  );
  const questionCodeToId = await models.question.findIdByCode(codes);

  for (const translation of valueTranslation) {
    const [code, value] = splitStringOn(translation, ':');
    const [questionCode, questionOption] = splitStringOn(code, '.');
    const questionId = questionCodeToId[questionCode];

    if (!translatedValueTranslation[questionId]) {
      translatedValueTranslation[questionId] = {};
    }
    translatedValueTranslation[questionId][questionOption] = value;
  }

  return translatedValueTranslation;
};

/**
 * answerDisplayText: SchFF00CalcTotal / SchFF00CalcTotalObtainable = $result
 * Question codes will be replaced by question ids
 * @param {*} models
 * @param {*} text
 * @param {*} codes
 */
const translateAnswerDisplayText = async (models, text, codes) => {
  let translatedText = text;
  const questionCodeToId = await models.question.findIdByCode(codes);

  // Note a difference between 'answerDisplayText' and 'formula' is question codes are not dollar prefixed
  for (const code of codes) {
    const questionId = questionCodeToId[code];
    translatedText = translatedText.replace(code, questionId);
  }

  return translatedText;
};
