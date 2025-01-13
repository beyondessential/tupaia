import { KeyValueCellBuilder } from '../KeyValueCellBuilder';

export class AutocompleteConfigCellBuilder extends KeyValueCellBuilder {
  individualFieldProcessors = {
    attributes: AutocompleteConfigCellBuilder.processAttributesField,
  };

  async processValue(value, key) {
    if (key === 'createNew') {
      return value ? 'Yes' : 'No';
    }
    return value;
  }

  /**
   * Currently we only actually support parent_project as an attribute
   * But this processor function processes all keys for future proofing
   * Since it's not a one to one relationship we can't run it through the generic handlers
   *
   * Input:
   * attributes: {
   *   parent_project: {
   *    questionId: <guid>
   *   }
   * }
   * Converted to Excel config:
   * attributes.parent_project: <questionCode>
   */
  static async processAttributesField(models, attributesObject = {}) {
    const processedAttributes = await Promise.all(
      Object.entries(attributesObject).map(async ([key, value]) => {
        const question = await models.question.findById(value?.questionId);
        if (!question) {
          throw new Error(`Could not find a question with id matching ${value?.questionId}`);
        }
        return `attributes.${key}: ${question.code}`;
      }),
    );
    return processedAttributes.join('\r\n');
  }

  extractRelevantObject({ autocomplete }) {
    return autocomplete;
  }
}
