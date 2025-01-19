import { KeyValueCellBuilder } from '../KeyValueCellBuilder';
import {
  replaceQuestionIdsWithCodes,
  getDollarPrefixedExpressionVariables,
} from '../../../../utilities';

export class ConditionConfigCellBuilder extends KeyValueCellBuilder {
  extractRelevantObject({ condition }) {
    return condition;
  }

  /**
   * Input:
   * conditions: {
   *   Yes: {
   *     formula: '5fa0cdcd5da1e614f30001fd >= 3',
   *     defaultValues: {
   *        '5fa0cdcd5da1e614f30001fd': '0',
   *     },
   *   },
   *   No: {
   *     formula: '5fa0cdcd5da1e614f30001fd < 3',
   *     defaultValues: {
   *       '5fa0cdcd5da1e614f30001fd': '0',
   *     },
   *   },
   * }
   * will be converted to:
   * Excel config:
   * conditions: Yes:RHS6UNFPA1353Calc >= 3,No:RHS6UNFPA1353Calc < 3
   *
   */
  async getExcelConditionConfig(conditions) {
    return (
      await Promise.all(
        Object.entries(conditions).map(async ([targetValue, config]) => {
          const { formula } = config;
          const translatedFormula = await replaceQuestionIdsWithCodes(
            this.models,
            formula,
            getDollarPrefixedExpressionVariables(formula),
            { useDollarPrefixes: true },
          );
          return `${targetValue}:${translatedFormula}`;
        }),
      )
    ).join(',');
  }

  /**
   *
   * conditions: {
   *   Yes: {
   *     formula: '5fa0cdcd5da1e614f30001fd >= 3',
   *     defaultValues: {
   *        '5fa0cdcd5da1e614f30001fd': '0',
   *     },
   *   },
   *   No: {
   *     formula: '5fa0cdcd5da1e614f30001fd < 3',
   *     defaultValues: {
   *       '5fa0cdcd5da1e614f30001fd': '0',
   *     },
   *   },
   * }
   * will be converted to:
   * Excel config:
   * defaultValues: Yes.RHS6UNFPA1353Calc:0,No.RHS6UNFPA1353Calc:0
   *
   */
  async getExcelDefaultValues(conditions) {
    const defaultValues = {};
    const promises = Object.entries(conditions).map(async ([targetValue, config]) => {
      const { defaultValues: defaultValuesConfig = {} } = config;
      return Promise.all(
        Object.entries(defaultValuesConfig).map(async ([questionId, value]) => {
          const question = await this.models.question.findById(questionId);
          const questionCode = question?.code || `[No question with id: ${questionId}]`;
          defaultValues[`${targetValue}.${questionCode}`] = value;
        }),
      );
    });

    await Promise.all(promises);

    if (Object.entries(defaultValues).length === 0) return undefined;

    return Object.entries(defaultValues)
      .map(([key, value]) => `${key}:${value}`)
      .join(',');
  }

  // We have to override the base class' build method because
  // 'conditions' and 'defaultValues' have to be built together
  async build(jsonStringOrObject) {
    try {
      if (!jsonStringOrObject) {
        return '';
      }
      const fullObject =
        typeof jsonStringOrObject === 'string'
          ? JSON.parse(jsonStringOrObject)
          : jsonStringOrObject;
      const config = this.extractRelevantObject(fullObject);
      const { conditions } = config;

      const translatedConfig = {
        conditions: await this.getExcelConditionConfig(conditions),
        defaultValues: await this.getExcelDefaultValues(conditions),
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
