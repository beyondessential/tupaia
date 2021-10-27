/**
 * Tupaia MediTrak
 * Copyright (c) 2021 Beyond Essential Systems Pty Ltd
 */

import { KeyValueCellBuilder } from './KeyValueCellBuilder';
import { unTranslateExpression, getDollarPrefixedExpressionVariables } from '../../../utilities';

export class ArithmeticConfigCellBuilder extends KeyValueCellBuilder {
  extractRelevantObject({ arithmetic }) {
    return arithmetic;
  }

  /**
   * Input:
   * {
   *     5ed7558b61f76a6ba5003114:0,
   *     5ec5bf8961f76a18ad00d4f9:0
   * }
   * Converted to Excel config:
   * SchFF00Section1Total:0,SchFF00Section1TotalObtainable:0
   * @param {*} defaultValuesConfig
   */
  async translateDefaultValues(defaultValuesConfig) {
    // const defaultValues = splitStringOnComma(defaultValuesConfig);
    // const translatedDefaultValues = {};
    // const codeToValue = {};
    // defaultValues.forEach(defaultValue => {
    //   const [code, value] = splitStringOn(defaultValue, ':');
    //   codeToValue[code] = value;
    // });
    // const questionCodeToId = await models.question.findIdByCode(Object.keys(codeToValue));

    // Object.entries(codeToValue).forEach(([code, value]) => {
    //   const questionId = questionCodeToId[code];
    //   translatedDefaultValues[questionId] = value;
    // });

    return translatedDefaultValues;
  }

  /**
   * Input:
   * {
   *		5ed7558b61f76a6ba5003114: { Yes: 3, No: 0 }
   * }
   * Converted to Excel config:
   * SchCVD016a.Yes:3,SchCVD016a.No:0
   * @param {*} valueTranslationConfig
   */
  async translateValueTranslation(valueTranslationConfig) {
    // const valueTranslation = splitStringOnComma(valueTranslationConfig);
    // const translatedValueTranslation = {};
    // const codes = [
    //   ...new Set( // Remove duplicated codes
    //     valueTranslation.map(defaultValue => {
    //       const [code] = splitStringOn(defaultValue, '.');
    //       return code;
    //     }),
    //   ),
    // ];
    // const questionCodeToId = await models.question.findIdByCode(codes);

    // for (const translation of valueTranslation) {
    //   const [code, value] = splitStringOn(translation, ':');
    //   const [questionCode, questionOption] = splitStringOn(code, '.');
    //   const questionId = questionCodeToId[questionCode];

    //   if (!translatedValueTranslation[questionId]) {
    //     translatedValueTranslation[questionId] = {};
    //   }
    //   translatedValueTranslation[questionId][questionOption] = value;
    // }

    return translatedValueTranslation;
  }

  /**
   *
   * Input:
   * abc_question_id_1 / abc_question_id_2 = $result
   * Converted to Excel config:
   * SchFF00CalcTotal / SchFF00CalcTotalObtainable = $result
   * @param {String} text
   * @param {*} codes
   */
  async translateAnswerDisplayText(text, questionIds) {
    let translatedText = text;
    const questionCodeToId = await this.fetchQuestionCode();

    for (const code of codes) {
      const questionId = questionCodeToId[code];
      translatedText = translatedText.replace(code, questionId);
    }

    return translatedText;
  }

  // We have to override the base class' build method because
  // translateAnswerDisplayText needs the question ids from the 'formula'
  async build(jsonStringOrObject) {
    if (!jsonStringOrObject) {
      return '';
    }
    const fullObject =
      typeof jsonStringOrObject === 'string' ? JSON.parse(jsonStringOrObject) : jsonStringOrObject;
    console.log({ fullObject });
    const config = this.extractRelevantObject(fullObject) || {};
    const { formula, defaultValues, valueTranslation, answerDisplayText } = config;

    const questionIds = getDollarPrefixedExpressionVariables(formula);
    console.log({ questionIds });

    const translatedConfig = {
      formula: await unTranslateExpression(this.models, formula, questionIds),
      defaultValues:
        defaultValues &&
        (await this.translateDefaultValues(this.models, answerDisplayText, questionIds)),
      answerDisplayText:
        answerDisplayText &&
        (await this.translateAnswerDisplayText(answerDisplayText, questionIds)),
      valueTranslation:
        valueTranslation &&
        (await this.translateValueTranslation(this.models, answerDisplayText, questionIds)),
    };
    console.log({ translatedConfig });

    return Object.entries(translatedConfig)
      .filter(([_, value]) => value !== undefined)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\r\n');
  }
}
