/**
 * Tupaia MediTrak
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import { KeyValueCellBuilder } from '../KeyValueCellBuilder';

const SPECIAL_VALUE_PROCESSORS = {
  type: value => value.join(','),
  createNew: value => (value ? 'Yes' : 'No'),
  allowScanQrCode: value => (value ? 'Yes' : 'No'),
  generateQrCode: value => (value ? 'Yes' : 'No'),
};
const KEY_TRANSLATION = {
  parentId: 'parent',
  grandparentId: 'grandparent',
};

export class EntityConfigCellBuilder extends KeyValueCellBuilder {
  individualFieldProcessors = {
    attributes: EntityConfigCellBuilder.processAttributesField,
  };

  processKey(key) {
    return KEY_TRANSLATION[key] || key;
  }

  async processValue(value, key) {
    return SPECIAL_VALUE_PROCESSORS[key]
      ? SPECIAL_VALUE_PROCESSORS[key](value)
      : this.fetchQuestionCode(value);
  }

  /**
   * Currently we only actually support parentId as an attribute
   * But this processor function processes all keys for future proofing
   * Since it's not a one to one relationship we can't run it through the generic handlers
   *
   * Input:
   * attibutes: {
   *   parentId: {
   *    questionId: <guid>
   *   }
   * }
   * Converted to Excel config:
   * attributes.parent: <questionCode>
   */
  static async processAttributesField(models, attributesObject = {}) {
    const processedAttributes = await Promise.all(
      Object.entries(attributesObject).map(async ([key, value]) => {
        const translatedKey = KEY_TRANSLATION[key] || key;
        const question = await models.question.findById(value?.questionId);
        if (!question) {
          throw new Error(`Could not find a question with id matching ${value?.questionId}`);
        }
        return `attributes.${translatedKey}: ${question.code}`;
      }),
    );
    return processedAttributes.join('\r\n');
  }

  extractRelevantObject({ entity }) {
    return entity;
  }
}
