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
    fields: EntityConfigCellBuilder.processFieldsObject,
    filter: EntityConfigCellBuilder.processFilterObject,
  };

  processKey(key) {
    return KEY_TRANSLATION[key] || key;
  }

  async processValue(value, key) {
    return SPECIAL_VALUE_PROCESSORS[key]
      ? SPECIAL_VALUE_PROCESSORS[key](value)
      : this.fetchQuestionCode(value);
  }

  extractRelevantObject({ entity }) {
    return entity;
  }

  static async processFieldsObject(models, fieldsObject = {}) {
    const processedFields = await Promise.all(
      Object.entries(fieldsObject).map(async ([key, value]) => {
        if (key === 'type') {
          return `fields.${key}: ${value}`;
        }
        if (key === 'attributes') {
          const processedAttributes = await Promise.all(
            Object.entries(value).map(async ([attributeKey, attributeValue]) => {
              const question = await models.question.findById(attributeValue?.questionId);
              if (!question) {
                throw new Error(
                  `Could not find a question with id matching ${attributeValue?.questionId}`,
                );
              }
              return `fields.attributes.${attributeKey}: ${question.code}`;
            }),
          );
          return processedAttributes.join('\r\n');
        }
        const question = await models.question.findById(value?.questionId);
        if (!question) {
          throw new Error(`Could not find a question with id matching ${value?.questionId}`);
        }
        const processedKey = KEY_TRANSLATION[key] || key;
        return `fields.${processedKey}: ${question.code}`;
      }),
    );
    return processedFields.join('\r\n');
  }

  static async processFilterObject(models, filterObject = {}) {
    const processedFilter = await Promise.all(
      Object.entries(filterObject).map(async ([key, value]) => {
        if (key === 'type') {
          return `filter.${key}: ${value.join(',')}`;
        }
        if (key === 'attributes') {
          const processedAttributes = await Promise.all(
            Object.entries(value).map(async ([attributeKey, attributeValue]) => {
              const question = await models.question.findById(attributeValue?.questionId);
              if (!question) {
                throw new Error(
                  `Could not find a question with id matching ${attributeValue?.questionId}`,
                );
              }
              return `filter.attributes.${attributeKey}: ${question.code}`;
            }),
          );
          return processedAttributes.join('\r\n');
        }
        const question = await models.question.findById(value?.questionId);
        if (!question) {
          throw new Error(`Could not find a question with id matching ${value?.questionId}`);
        }
        const processedKey = KEY_TRANSLATION[key] || key;
        return `filter.${processedKey}: ${question.code}`;
      }),
    );
    return processedFilter.join('\r\n');
  }
}
