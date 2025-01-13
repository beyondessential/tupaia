import { KeyValueCellBuilder } from '../KeyValueCellBuilder';
import {
  replaceQuestionIdsWithCodes,
  getDollarPrefixedExpressionVariables,
} from '../../../../utilities';

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
    const promises = Object.entries(defaultValuesConfig).map(async ([key, value]) => {
      const question = await this.models.question.findById(key);
      return `${question?.code || `[No question with id: ${key}]`}:${value}`;
    });
    return (await Promise.all(promises)).join(',');
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
    const questionIds = Object.keys(valueTranslationConfig);
    const translatedValueTranslation = {};

    for (const id of questionIds) {
      const question = await this.models.question.findById(id);
      const code = question?.code || `[No question with id: ${id}]`;
      // eg. key = Yes, value = 3
      Object.entries(valueTranslationConfig[id]).forEach(([key, value]) => {
        translatedValueTranslation[`${code}.${key}`] = value;
      });
    }

    return Object.entries(translatedValueTranslation)
      .map(([key, value]) => `${key}:${value}`)
      .join(',');
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
    return replaceQuestionIdsWithCodes(this.models, text, questionIds, {
      useDollarPrefixes: false,
    });
  }

  // We have to override the base class' build method because
  // translateAnswerDisplayText needs the question ids from the 'formula'
  async build(jsonStringOrObject) {
    try {
      if (!jsonStringOrObject) {
        return '';
      }
      const fullObject =
        typeof jsonStringOrObject === 'string'
          ? JSON.parse(jsonStringOrObject)
          : jsonStringOrObject;
      const config = this.extractRelevantObject(fullObject) || {};
      const { formula, defaultValues, valueTranslation, answerDisplayText } = config;

      const questionIds = getDollarPrefixedExpressionVariables(formula);

      const translatedConfig = {
        formula: await replaceQuestionIdsWithCodes(this.models, formula, questionIds, {
          useDollarPrefixes: true,
        }),
        defaultValues: defaultValues && (await this.translateDefaultValues(defaultValues)),
        valueTranslation:
          valueTranslation && (await this.translateValueTranslation(valueTranslation)),
        answerDisplayText:
          answerDisplayText &&
          (await this.translateAnswerDisplayText(answerDisplayText, questionIds)),
      };

      return Object.entries(translatedConfig)
        .filter(([, value]) => value !== undefined)
        .map(([key, value]) => `${key}: ${value}`)
        .join('\r\n');
    } catch {
      return `Error building config for export, prebuilt config was: ${jsonStringOrObject}`;
    }
  }
}
